// @flow

import {Solution} from "./model/solution";
import nearestFree from "./model/dijkstra";
import {Coord, Matrix, State, Rover, DRILL_TIME} from "./model/model";

const maxSearchLen = 15;

export function findPath(s: State, worker : Rover, isDrilling: boolean) {

  let source = worker.pos.getCopy();
  let lens = new Matrix(s.m.w, s.m.h);
  let front = new Array(source.getCopy());
  lens.set(source.x, source.y, 1);

  let nearestFree : Coord = 0;
  let bestPixelCost = 0;

  while(front.length) {
    let c = front[0];
    let curLen = lens.get(c.x, c.y);

    // exceeded the search radius - go to just a free cell
    if(curLen >= maxSearchLen && nearestFree !== 0) {
      //console.log("exceeded range");
      break;
    }

    front.shift();

    let dirs = {
      0 : {
        nx : c.x,
        ny : c.y + 1,
      },
      3 : {
        nx : c.x + 1,
        ny : c.y,
      },
      6 : {
        nx : c.x,
        ny : c.y - 1,
      },
      9 : {
        nx : c.x - 1,
        ny : c.y,
      }
    };

    // go this dir first
    // let nx = dirs[worker.rotation].nx;
    // let ny = dirs[worker.rotation].ny;
    //
    // delete dirs[worker.rotation];
    //
    // if(s.m.isValid(nx, ny)) {
    //   if (s.checkBooster(nx, ny)) {
    //     nearestFree = new Coord(nx, ny);
    //     break;
    //   }
    //   if (s.m.isFree(nx, ny) /*&& nearestFree === 0*/) {
    //     let cost = pixelCost(s.m, nx, ny);
    //
    //     if(cost > bestPixelCost || nearestFree === 0) {
    //       nearestFree = new Coord(nx, ny);
    //       bestPixelCost = cost;
    //     }
    //   }
    //   if ((s.m.isPassable(nx, ny) || isDrilling) && lens.get(nx, ny) === 0) {
    //     front.push(new Coord(nx, ny));
    //     lens.set(nx, ny, curLen + 1);
    //   }
    // }
    //console.log(dirs);
    let isFound = false;
    for (let dirsKey in dirs) {
      let nx = dirs[dirsKey].nx;
      let ny = dirs[dirsKey].ny;

      if(s.m.isValid(nx, ny)) {
        if (s.checkBooster(nx, ny)) {
          nearestFree = new Coord(nx, ny);
          isFound = true;
          break;
        }
        if (s.m.isFree(nx, ny) /*&& nearestFree === 0*/) {
          // let cost = pixelCost(s.m, nx, ny) / Math.pow(curLen, 1);
          let cost = 1;

          if(cost > bestPixelCost || nearestFree === 0) {
            nearestFree = new Coord(nx, ny);
            bestPixelCost = cost;
          }
        }
        if ((s.m.isPassable(nx, ny) || isDrilling) && lens.get(nx, ny) === 0) {
          front.push(new Coord(nx, ny));
          lens.set(nx, ny, curLen + 1);
        }
      }
    }

    if(isFound)
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

    let nx = c.x + 1;
    let ny = c.y;
    if(source.x === nx && source.y === ny)
      break;
    if(lens.get(nx, ny) < minL && lens.get(nx, ny) !== 0 && lens.isValid(nx, ny)) {
      minL = lens.get(nx, ny);
      minC = new Coord(nx, ny);
    }

    nx = c.x;
    ny = c.y + 1;
    if(source.x === nx && source.y === ny)
      break;
    if(lens.get(nx, ny) < minL && lens.get(nx, ny) !== 0 && lens.isValid(nx, ny)) {
      minL = lens.get(nx, ny);
      minC = new Coord(nx, ny);
    }

    nx = c.x - 1;
    ny = c.y;
    if(source.x === nx && source.y === ny)
      break;
    if(lens.get(nx, ny) < minL && lens.get(nx, ny) !== 0 && lens.isValid(nx, ny)) {
      minL = lens.get(nx, ny);
      minC = new Coord(nx, ny);
    }

    nx = c.x;
    ny = c.y - 1;
    if(source.x === nx && source.y === ny)
      break;
    if(lens.get(nx, ny) < minL && lens.get(nx, ny) !== 0 && lens.isValid(nx, ny)) {
      minL = lens.get(nx, ny);
      minC = new Coord(nx, ny);
    }

    if(!minC)
      throw "Weird shit happened";

    path.unshift(minC);
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
    while(true) {
      let path = findPath(this.state, this.state.worker, false);
      if (path === undefined)
        return this.solution;

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

          if ((this.state.worker.rotation === 0 && dx > 0)
            || (this.state.worker.rotation === 3 && dy < 0)
            || (this.state.worker.rotation === 6 && dx < 0)
            || (this.state.worker.rotation === 9 && dy > 0)) {
            this.solution.turnManipulatorsClockwise();
            this.state.worker.rotCW();
            this.state.moveWorker(this.state.worker.pos);
          } else if ((this.state.worker.rotation === 0 && dx < 0)
            || (this.state.worker.rotation === 3 && dy > 0)
            || (this.state.worker.rotation === 6 && dx > 0)
            || (this.state.worker.rotation === 9 && dy < 0)) {
            this.solution.turnManipulatorsCounterclockwise();
            this.state.worker.rotCCW();
            this.state.moveWorker(this.state.worker.pos);
          }
        }

        this.solution.move(this.state.worker.pos, path[i]);
        this.state.moveWorker(path[i]);

        if (this.state.extensions > 0) {
          this.state.extensions--;
          let c = this.state.worker.extendManipulators();
          this.solution.attachNewManipulatorWithRelativeCoordinates(c.x, c.y);
        }

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
}
