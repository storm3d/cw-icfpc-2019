// @flow

import {Solution} from "./model/solution";
import nearestFree from "./model/dijkstra";
import {Coord, Matrix, WaveMatrix, State, Rover, DRILL_TIME, FAST_TIME} from "./model/model";

const maxSearchLen = 15;


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

export function findPath(s: State, worker : Rover, options: Object) {

  let isDrilling = options.isDrilling || false;
  let isWheeling = options.isWheeling || false;

  let workerCopy = worker.getCopy();
  let source = worker.pos.getCopy();
  //let lens = new Matrix(s.m.w, s.m.h);
  let wavestep = new WaveMatrix(s.m.w, s.m.h);
  let front = new Array(source.getCopy());
  wavestep.set(source.x, source.y, 1);

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
  let getDirs = (c: Coord) : Object => {
    let nxny = getCoordNXNY(c);
    return {
        0 : nxny[0],
        3 : nxny[1],
        6 : nxny[2],
        9 : nxny[3],
      };
  };

  let tryDirection = (nx: number, ny: number, curLen: number, cIndex: number) : boolean => {
    if(!s.m.isValid(nx, ny)) {
      return false;
    }

    if (s.checkBooster(nx, ny)) {
      nearestFree = new Coord(nx, ny);
      wavestep.set(nx, ny, curLen + 1, cIndex);
      return true;
    }
    if (s.m.isFree(nx, ny) /*&& nearestFree === 0*/) {
      // let cost = pixelCost(s.m, nx, ny) / Math.pow(curLen, 1);
      let cost = 1;

      if(cost > bestPixelCost || nearestFree === 0) {
        nearestFree = new Coord(nx, ny);
        bestPixelCost = cost;
        wavestep.prev[wavestep.toIndex(nx, ny)] = cIndex;
      }
    }
    if ((isDrilling || s.m.isPassable(nx, ny)) && wavestep.get(nx, ny) === 0) {
      front.push(new Coord(nx, ny));
      wavestep.set(nx, ny, curLen + 1, cIndex);
    }
    return false;
  }

  while(front.length) {
    let c = front[0];
    let cIndex = wavestep.toIndex(c.x, c.y);
    let curLen = wavestep.get(c.x, c.y);

    // exceeded the search radius - go to just a free cell
    if(curLen >= maxSearchLen && nearestFree !== 0) {
      //console.log("exceeded range");
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

      isFound = tryDirection(nx, ny, curLen, cIndex);
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
  let btIndex = wavestep.toIndex(nearestFree.x, nearestFree.y);
  let prev = wavestep.prev[btIndex];
  while (prev >= 0) {
    let prevC = wavestep.toCoord(prev);
    prev = wavestep.prev[prev];
    path.unshift(prevC);
  }

  return path;
}


export function pixelCost(matrix: Matrix, x: number, y: number): number {
  let cost = 0;

  let i = matrix.toIndex(x, y);

  if (matrix.isFreeIndex(i)) {
    let n = matrix.getNeighbors(new Coord(x, y), 2);
    let blockedNeighbors = 0;
    let wrappedNeighbors = 0;

    n.forEach(k => {
      if (!matrix.isValid(k.x, k.y) || matrix.isObstacle(k.x, k.y)) blockedNeighbors++;
      if (matrix.isValid(k.x, k.y) && matrix.isWrapped(k.x, k.y)) wrappedNeighbors++;
    });

    cost += 1 + wrappedNeighbors * 0.1 + blockedNeighbors * 0.5;
  }
  return cost;
}

export default class Solver {

  state : State;
  solution : Solution;

  constructor(state : State) {
    this.state = state;
    this.solution = new Solution();
  }

  solve(): Solution {

    let drillTurns = 0;
    let drilling = false;

    let wheelsTurns = 0;
    let wheelsAttached = false;
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
            if (drillTurns == 0 && drilling && this.state.drills > 0){
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
      let path = findPath(this.state, this.state.worker, {});
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
          teleportObj.path = findPath(this.state, workerT, {});

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
        path = findPath(this.state, this.state.worker, {});
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
          let path1 = findPath(this.state, this.state.worker, {isDrilling: true});
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
        let pathCoord = path[i];

        if (this.state.m.getFreeNeighborsNum(pathCoord.x, pathCoord.y, 1) > 0) {
          let dx = -(this.state.worker.pos.x - pathCoord.x);
          let dy = -(this.state.worker.pos.y - pathCoord.y);

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

        this.solution.move(this.state.worker.pos, pathCoord);
        this.state.moveWorker(pathCoord);
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
}
