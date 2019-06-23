// @flow

import {Solution} from "./model/solution";
import nearestFree from "./model/dijkstra";
import {Coord, Matrix, State, Rover, DRILL_TIME, FAST_TIME} from "./model/model";
import { MANIPULATOR_PRICE } from './constants/boosters';

const maxSearchLen = 10000;
const minSearchLen = 1;


export function getTurnType(rotation : number, dx : number, dy : number) : number {
  if((rotation === 0 && dx > 0)
    || (rotation === 3 && dy < 0)
    || (rotation === 6 && dx < 0)
    || (rotation === 9 && dy > 0)) {
      return 1;
  }
  else if((rotation === 0 && dx < 0)
    || (rotation === 3 && dy > 0)
    || (rotation === 6 && dx > 0)
    || (rotation === 9 && dy < 0)) {
      return 2;
  }
  return 0;
}

export function findPath(s: State, worker : Rover, isDrilling: boolean) {

  //let workerCopy = worker.getCopy();
  let isSeekingBoosters = s.getRemainingBoostersNum() > 0;
  let searchLen = isSeekingBoosters ? maxSearchLen : minSearchLen;

  let source = worker.pos.getCopy();
  let lens = new Matrix(s.m.w, s.m.h);
  let front = new Array(source.getCopy());
  lens.set(source.x, source.y, 1);

  let nearestFree : Coord = 0;
  let bestPixelCost = 0;
  let getCoordNXNY = (c: Coord) : Array<Object> => {
    return [{
          nx : c.x,
          ny : c.y + 1,
        }, {
          nx : c.x + 1,
          ny : c.y,
        }, {
          nx : c.x,
          ny : c.y - 1,
        }, {
          nx : c.x - 1,
          ny : c.y,
        },
      ];
  };
  let getDirs2 = (c: Coord) : Object => {
    let nxny = getCoordNXNY(c);
    return [
        nxny[1],
        nxny[0],
        nxny[3],
        nxny[2],
      ];
  };
  let getDirs2bt = (c: Coord) : Object => {
    let nxny = getCoordNXNY(c);
    return [
        nxny[2],
        nxny[3],
        nxny[0],
        nxny[1],
      ];
  };
  /*
  let getDirs = (c: Coord) : Object => {
    let nxny = getCoordNXNY(c);
    return {
        0 : nxny[0],
        3 : nxny[1],
        6 : nxny[2],
        9 : nxny[3],
      };
  };*/

  let tryDirection = (nx: number, ny: number, curLen: number) : boolean => {
    if(!s.m.isValid(nx, ny)) {
      return false;
    }

    if (isSeekingBoosters && s.checkBooster(nx, ny)) {
      nearestFree = new Coord(nx, ny);
      return true;
    }
    if (s.m.isFree(nx, ny) /*&& nearestFree === 0*/) {
      let cost = pixelCost(s.m, nx, ny);

      //let cost = 1;

      if(cost > bestPixelCost || nearestFree === 0) {

        //console.log(cost);
        nearestFree = new Coord(nx, ny);
        bestPixelCost = cost;
      }
    }
    if ((s.m.isPassable(nx, ny) || isDrilling) && lens.get(nx, ny) === 0) {
      front.push(new Coord(nx, ny));
      lens.set(nx, ny, curLen + 1);
    }
    return false;
  };

  while(front.length) {
    let c = front[0];
    let curLen = lens.get(c.x, c.y);

    // exceeded the search radius - go to just a free cell
    if(curLen >= searchLen && nearestFree !== 0) {
      //console.log("exceeded range " + curLen);
      break;
    }

    front.shift();

    let dirs = getDirs2(c);
    // go this dir first
    // let nx = dirs[worker.rotation].nx;
    // let ny = dirs[worker.rotation].ny;
    //
    // delete dirs[worker.rotation];
    //
    // if (tryDirection(nx, ny)) break;
    //console.log(dirs);

    let isFound = false;
    for (let dirsKey in dirs) {
      let nx = dirs[dirsKey].nx;
      let ny = dirs[dirsKey].ny;

      isFound = tryDirection(nx, ny, curLen);
      if (isFound) break;
    }

    if (isFound)
      break;

    //console.log("front");
    //console.log(front);
  }

  //console.log(nearestFree);

  if(nearestFree === 0)
    return undefined;

  let path = [ nearestFree ];

  while(true) {
    //console.log(path);

    let c = path[0];
    let minL = 999999;
    let minC = 0;
    let backtrack_dirs = getDirs2bt(c);

    let backTrackNextCell = (nx: number, ny: number) => {
      if (!lens.isValid(nx, ny)) return;
      let lensXY = lens.get(nx, ny);
      if (lensXY < minL && lensXY !== 0) {
        minL = lensXY;
        minC = new Coord(nx, ny);
      }
    };

    let backTrackDone = false;
    for (let btKey in backtrack_dirs) {
      let nx = backtrack_dirs[btKey].nx;
      let ny = backtrack_dirs[btKey].ny;

      // check if backtrack is done
      backTrackDone = (source.x === nx && source.y === ny);
      if (backTrackDone)
        break;
      backTrackNextCell(nx, ny);

    }
    if (backTrackDone)
      break;

    if(!minC)
      throw "Weird shit happened";

    path.unshift(minC);
  }

  return path;
}


export function pixelCost(matrix: Matrix, x: number, y: number): number {
  return 10000-matrix.getFreeNeighborsNum(x, y, 5);
}

export default class Solver {

  state : State;
  solution : Solution;
  coins: number = 0;

  constructor(state : State) {
    this.state = state;
    this.solution = new Solution();
  }

  setCoins(coins: number): void {
    this.coins = coins;

    if (this.coins) {
      this.buyBoosters();
    }
  }

  solve(): Solution {
    let drillTurns = 0;
    let drilling = false;

    let wheelsTurns = 0;
    //let wheelsAttached = false;
    let hasActiveTeleport = false;
    let teleportPos: Coord;
    let matrixCenter = new Coord(this.state.m.w /2 , this.state.m.h /2);
    let isNear = (a: Coord, b: Coord, d: number) => {
      let diff = a.getDiff(b);
      return (Math.abs(diff.x) + Math.abs(diff.y)) < d;
    };
    let isNearCenter = (c: Coord) => {
      return isNear(c, matrixCenter, 20);
    };

    let stepActiveBoosters = () => {
        // if drill is ON
        if (drillTurns > 0) {
            drillTurns--;
            // continue if drilling
            if (drillTurns === 0 && drilling && this.state.drills > 0){
              this.state.drills--;
              this.solution.startUsingDrill();
              drillTurns = DRILL_TIME;
            }
        }
        // if Fast is ON
      if (wheelsTurns > 0) {
        wheelsTurns--;
      }
    };

    let prevTeleportLen = 0;
    while(true) {
      let path = findPath(this.state, this.state.worker, false);
      if (path === undefined) {
        if (this.state.m.getFreeNum() > 0) {
          throw "WUT ???";
        }
        return this.solution;
      }

      if (hasActiveTeleport && (path.length > (prevTeleportLen + 5))) {
        let workerT = this.state.worker.getCopy();
        workerT.pos = teleportPos;
        let pathT = findPath(this.state, workerT, false);
        prevTeleportLen = pathT.length;
        if ((pathT.length + 25 < path.length) & !isNear(teleportPos, this.state.worker.pos, 10)) {
          this.solution.activateTeleport(teleportPos.x, teleportPos.y);
          this.state.moveWorker(teleportPos);
          stepActiveBoosters();
          //
          path = findPath(this.state, this.state.worker, false);
        }
      }
      // dumb greedy teleports
      //if (false) {
      if (!drilling && !hasActiveTeleport && (this.state.teleports > 0) && isNearCenter(this.state.worker.pos) && matrixCenter.x > 50 && matrixCenter.y > 50) {
        hasActiveTeleport = true;
        this.state.teleports--;
        this.solution.plantTeleport();
        teleportPos = this.state.worker.pos.getCopy();
        prevTeleportLen = path.length;
        //stepActiveBoosters();
      }

      // dumb greedy drills
      //if (false) {
      if (this.state.drills > 0 || drillTurns > 0) {
          drilling = false;
          let path1 = findPath(this.state, this.state.worker, true);
          if ((path1.length + 20 < path.length) &&
               (path1.length < (drillTurns + this.state.drills * DRILL_TIME))) {
              //console.log(`!!!!!!!!!!!!${path.length}, ${path1.length}`);
              path = path1;
              if (drillTurns == 0) {
                  this.state.drills--;
                  this.solution.startUsingDrill();
                  drillTurns = DRILL_TIME;
              }
              drilling = true;
          }
      }
      // console.log(path);

      for (let i = 0; i < Math.ceil(path.length /*/ 2*/); i++) {
        if (this.state.m.getFreeNeighborsNum(path[i].x, path[i].y, 1) > 0) {
          let dx = -(this.state.worker.pos.x - path[i].x);
          let dy = -(this.state.worker.pos.y - path[i].y);

          let turnType = getTurnType(this.state.worker.rotation, dx, dy);
          if (turnType === 1) { // CW
            this.solution.turnManipulatorsClockwise();
            this.state.worker.rotCW();
            this.state.moveWorker(this.state.worker.pos);
            stepActiveBoosters();
          } else if (turnType === 2) { // CCW
            this.solution.turnManipulatorsCounterclockwise();
            this.state.worker.rotCCW();
            this.state.moveWorker(this.state.worker.pos);
            stepActiveBoosters();
          }
        }

        this.solution.move(this.state.worker.pos, path[i]);
        this.state.moveWorker(path[i]);
        // if drill is ON
        stepActiveBoosters();

        if (this.state.extensions > 0) {
          this.state.extensions--;
          let c = this.state.worker.extendManipulators();
          this.solution.attachNewManipulatorWithRelativeCoordinates(c.x, c.y);
          stepActiveBoosters();
        }
        // console.log(this.state.dump(true));
      }
    }

    return this.solution;
  }

  solve_DFS_FreeNum(): Solution {
      let front = new Map();
      let solution = new Solution();
      solution.state = this.state;

      let calcWeight = (s) => {return s.state.m.getFreeNum();}
      let calcNewTop = (f) => {return Array.from(f.keys()).sort()[0]; }
      let topKey = calcWeight(solution);
      front.set(topKey, [solution]);

      //console.log(calcNewTop(front), topKey);

      while(topKey > 0) {
          let top = front.get(topKey);
          //
          let trySolution = top.shift();

          break;
      }
      return this.solution;
  }

  /** @private */
  buyBoosters(): void {
    while (this.coins >= MANIPULATOR_PRICE) {
      this.buyManipulator();
    }
  }

  /** @private */
  buyManipulator() {
    this.coins = this.coins - MANIPULATOR_PRICE;
    this.state.extensions = this.state.extensions ? this.state.extensions + 1 : 1;
  }
}
