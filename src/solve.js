// @flow

import {Solution} from "./model/solution";
import nearestFree from "./model/dijkstra";
import {Coord, Matrix, WaveMatrix, State, Rover, DRILL_TIME, FAST_TIME} from "./model/model";
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

export function getWorkerTurnType(m: Matrix, curPos: Coord, nextPos: Coord, rotation: number) : number {
  if (m.getFreeNeighborsNum(nextPos.x, nextPos.y, 1) > 0) {
    let dx = -(curPos.x - nextPos.x);
    let dy = -(curPos.y - nextPos.y);

    return getTurnType(rotation, dx, dy);
  }
  return 0;
}

export function findPath(s: State, worker : Rover, options: Object) {

  let isDrilling = options.isDrilling || false;
  let fastTime = options.fastTime || -1;

  //let workerCopy = worker.getCopy();
  let isSeekingBoosters = s.getRemainingBoostersNum() > 0;
  let searchLen = isSeekingBoosters ? maxSearchLen : minSearchLen;

  let source = worker.pos.getCopy();
  let wavestep = new WaveMatrix(s.m.w, s.m.h);
  let front = new Array(source.getCopy());
  wavestep.set(source.x, source.y, 1, -1, worker.rotation);

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

  let getNextRotation = (oldPos: Coord, newPos: Coord, rotation: number) => {
    let turnType = getWorkerTurnType(s.m, oldPos, newPos, rotation);
    if (turnType === 1) {
        return worker.getRotCW(rotation);
    } else if (turnType === 2) {
        return worker.getRotCCW(rotation);
    }
    return rotation;
  };


  let tryDirection = (nx: number, ny: number, curLen: number, cIndex: number) : boolean => {
    if(!s.m.isValid(nx, ny)) {
      return false;
    }

    if (isSeekingBoosters && s.checkBooster(nx, ny)) {
      nearestFree = new Coord(nx, ny);
      let nextRotation = getNextRotation(nearestFree, wavestep.toCoord(cIndex), wavestep.rotation[cIndex]);
      wavestep.set(nx, ny, curLen + 1, cIndex, nextRotation);
      return true;
    }
    if (s.m.isFree(nx, ny) /*&& nearestFree === 0*/) {
      let cost = pixelCost(s.m, nx, ny);

      //let cost = 1;

      if(cost > bestPixelCost || nearestFree === 0) {
        //console.log(cost);
        nearestFree = new Coord(nx, ny);
        bestPixelCost = cost;
        let nextRotation = getNextRotation(nearestFree, wavestep.toCoord(cIndex), wavestep.rotation[cIndex]);
        wavestep.setPrev(nx, ny, cIndex, nextRotation);
      }
    }
    if ((isDrilling || s.m.isPassable(nx, ny)) && wavestep.get(nx, ny) === 0) {
      let newCoord = new Coord(nx, ny);
      front.push(newCoord);
      let nextRotation = getNextRotation(newCoord, wavestep.toCoord(cIndex), wavestep.rotation[cIndex]);
      wavestep.set(nx, ny, curLen + 1, cIndex);
    }
    return false;
  };

  let tryDirectionFasting = (nx: number, ny: number, curLen: number, cIndex: number) : boolean => {
    if(!s.m.isValid(nx, ny)) {
      return false;
    }
    if (!(isDrilling || s.m.isPassable(nx, ny))) {
      return false;
    }
    let c = wavestep.toCoord(cIndex);
    // extrastep
    let nx2 = nx + (nx - c.x);
    let ny2 = ny + (ny - c.y);
    return tryDirection(nx2, ny2, curLen, cIndex);
  };

  let tryDirections = (pos: Coord, curLen: number): boolean => {
    let dirs = getDirs2(pos);
    let cIndex = wavestep.toIndex(pos.x, pos.y);
    for (let dirsKey in dirs) {
      let nx = dirs[dirsKey].nx;
      let ny = dirs[dirsKey].ny;

      if (tryDirection(nx, ny, curLen, cIndex))
        return true;
    }
    return false;
  };

  ////////////// forward wave
  while(front.length) {
    let c = front.shift();

    let curLen = wavestep.get(c.x, c.y);

    // exceeded the search radius - go to just a free cell
    if(curLen >= searchLen && nearestFree !== 0) {
      //console.log("exceeded range " + curLen);
      break;
    }

    if (tryDirections(c, curLen))
      break;
  }

  //console.log(nearestFree);

  if(nearestFree === 0)
    return undefined;

  ///////////// backtracking + filling for turns
  let path = [ nearestFree ];
  let btIndex = wavestep.toIndex(nearestFree.x, nearestFree.y);
  let prev = wavestep.prev[btIndex];
  while (prev >= 0) {
    if (wavestep.rotation[btIndex] != wavestep.rotation[prev]) {
      path.unshift(null); // add rotation as null
    }
    btIndex = prev;
    let prevC = wavestep.toCoord(prev);
    prev = wavestep.prev[prev];
    path.unshift(prevC);
  }
  if (wavestep.rotation[btIndex] != worker.rotation) {
      path.unshift(null); // add rotation as null
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

    let hasActiveTeleport: Array<Object> = [];
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

    while(true) {
      let path = findPath(this.state, this.state.worker, {fastTime: wheelsTurns});
      if (path === undefined) {
        if (this.state.m.getFreeNum() > 0) {
          throw "WUT ???";
        }
        return this.solution;
      }

      //// TELEPORTS: ///////////////////////////
      let bestTeleport = {len: 999999, pos: null};
      hasActiveTeleport.forEach(teleportObj => {
        if (path.length > (teleportObj.path.length + 5)) {
          // get path from teleport for current worker configuration
          let workerT = this.state.worker.getCopy();
          workerT.pos = teleportObj.pos;
          teleportObj.path = findPath(this.state, workerT, {fastTime: wheelsTurns - 1});

          // check if it is better than the best
          if (bestTeleport.len > teleportObj.path.length) {
            // check if it is better than existing
            let pathIsBetter = (teleportObj.path.length + 25 < path.length);
            let isWorkerNear = isNear(teleportObj.pos, this.state.worker.pos, 10);

            if (pathIsBetter && !isWorkerNear) {
              bestTeleport = {
                  len : teleportObj.path.length,
                  pos : teleportObj.pos,
                };
            }
          }
        }
      });
      // go to best teleport if any
      if (bestTeleport.pos) {
        this.solution.activateTeleport(bestTeleport.pos.x, bestTeleport.pos.y);
        this.state.moveWorker(bestTeleport.pos);
        stepActiveBoosters();
        //
        path = findPath(this.state, this.state.worker, {fastTime: wheelsTurns});
      }

      // greedy teleports :
      //if (false) {
      if (!drilling && (this.state.teleports > 0) && matrixCenter.x > 20 && matrixCenter.y > 20) {
        // plant teleport near center if we have only one
        let plantTeleportHere = !hasActiveTeleport && isNearCenter(this.state.worker.pos);
        // or if we have spare - then somewhere far apart from existing
        let DEBUG_PLANT_MORE_THAN_ONE = false; // TODO: remove
        if (DEBUG_PLANT_MORE_THAN_ONE && !plantTeleportHere && (this.state.teleports > 1)) {
          let teleportsNear = hasActiveTeleport.filter(t => isNear(t.pos, this.state.worker.pos, 20));
          plantTeleportHere = teleportsNear.length == 0;
        }
        if (plantTeleportHere){
          this.state.teleports--;
          this.solution.plantTeleport();
          let newTeleport = {
            pos: this.state.worker.pos.getCopy(),
            path: path,
            };
          hasActiveTeleport.push(newTeleport);
          stepActiveBoosters();
        }
      }
      //// TELEPORTS END ///////////////////////////

      // dumb greedy drills
      //if (false) {
      if (this.state.drills > 0 || drillTurns > 0) {
          let path1 = findPath(this.state, this.state.worker, {isDrilling: true, fastTime: wheelsTurns - 1});
          // consider path if you actually can do it
          let considerDrilling = (path1.length < (drillTurns + this.state.drills * DRILL_TIME));
          //
          drilling = considerDrilling && ((path1.length + 20 < path.length) );
          if (drilling) {
              //console.log(`!!!!!!!!!!!!${path.length}, ${path1.length}`);
              path = path1;
              if (drillTurns == 0) {
                  this.state.drills--;
                  this.solution.startUsingDrill();
                  drillTurns = DRILL_TIME;
              }
          }
      }
      // console.log(path);

      for (let i = 0; i < Math.ceil(path.length /*/ 2*/); i++) {
        // skip fillers
        if (path[i] === null){
          continue;
        }
        let curPos = this.state.worker.pos;
        let nextPos = path[i];

        let turnType = getWorkerTurnType(this.state.m, curPos, nextPos, this.state.worker.rotation);
        if (turnType !== 0) {
          if (turnType === 1) { // CW
            this.solution.turnManipulatorsClockwise();
            this.state.worker.rotCW();
          } else if (turnType === 2) { // CCW
            this.solution.turnManipulatorsCounterclockwise();
            this.state.worker.rotCCW();
          }
          // fake move to apply changes
          this.state.moveWorker(curPos);
          stepActiveBoosters();
        }
        // do actual move
        this.solution.move(this.state.worker.pos, nextPos);
        this.state.moveWorker(nextPos);
        // if drill is ON
        stepActiveBoosters();
        // console.log(this.state.dump(true));
      }

      if (this.state.extensions > 0) {
        this.state.extensions--;
        let c = this.state.worker.extendManipulators();
        this.solution.attachNewManipulatorWithRelativeCoordinates(c.x, c.y);
        stepActiveBoosters();
      }


    }

    return this.solution;
  }

  solve_DFS_FreeNum(): Solution {
      let DSFlist = new Map();
      let solution = new Solution();
      solution.state = this.state;

      let calcWeight = (s) => {return s.state.m.getFreeNum();}
      let calcNewTop = (f) => {return Array.from(f.keys()).sort()[0]; }
      let topKey = calcWeight(solution);
      DSFlist.set(topKey, [solution]);

      //console.log(calcNewTop(DSFlist), topKey);

      while(topKey > 0) {
          let top = DSFlist.get(topKey);
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
