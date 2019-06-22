// @flow

import {Solution} from "./model/solution";
import nearestFree from "./model/dijkstra";
import {Coord, Matrix, State, Rover} from "./model/model";

const maxSearchLen = 15;

export function findPath(s: State, worker : Rover) {

  let source = worker.pos.getCopy();
  let lens = new Matrix(s.m.w, s.m.h);
  let front = new Array(source.getCopy());
  lens.set(source.x, source.y, 1);

  let nearestFree : Coord = 0;

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
    let nx = dirs[worker.rotation].nx;
    let ny = dirs[worker.rotation].ny;

    delete dirs[worker.rotation];

    if(s.m.isValid(nx, ny)) {
      if (s.checkBooster(nx, ny)) {
        nearestFree = new Coord(nx, ny);
        break;
      }
      if (s.m.isFree(nx, ny) && nearestFree === 0) {
        nearestFree = new Coord(nx, ny);
      }
      if (s.m.isPassable(nx, ny) && lens.get(nx, ny) === 0) {
        front.push(new Coord(nx, ny));
        lens.set(nx, ny, curLen + 1);
      }
    }
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
        if (s.m.isFree(nx, ny) && nearestFree === 0) {
          nearestFree = new Coord(nx, ny);
        }
        if (s.m.isPassable(nx, ny) && lens.get(nx, ny) === 0) {
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

    let c = path[path.length - 1];
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

    path.push(minC);
  }

  return path.reverse();
}

export default class Solver {

  state : State;
  solution : Solution;

  constructor(state : State) {
    this.state = state;
    this.solution = new Solution();
  }

  solve(): Solution {

    while(true) {
      let path = findPath(this.state, this.state.worker);
      if (path === undefined)
        return this.solution;

      // console.log(path);

      let pathLen = path.length > 1 ? path.length - 1 : path.length;
      for (let i = 0; i < pathLen; i++) {
        let dx = -(this.state.worker.pos.x - path[i].x);
        let dy = -(this.state.worker.pos.y - path[i].y);

        if((this.state.worker.rotation === 0 && dx > 0)
          || (this.state.worker.rotation === 3 && dy < 0)
          || (this.state.worker.rotation === 6 && dx < 0)
          || (this.state.worker.rotation === 9 && dy > 0)) {
          this.solution.turnManipulatorsClockwise();
          this.state.worker.rotCW();
          this.state.moveWorker(this.state.worker.pos);
        }
        else if((this.state.worker.rotation === 0 && dx < 0)
          || (this.state.worker.rotation === 3 && dy > 0)
          || (this.state.worker.rotation === 6 && dx > 0)
          || (this.state.worker.rotation === 9 && dy < 0)) {
          this.solution.turnManipulatorsCounterclockwise();
          this.state.worker.rotCCW();
          this.state.moveWorker(this.state.worker.pos);
        }

        this.solution.move(this.state.worker.pos, path[i]);
        this.state.moveWorker(path[i]);

        if (this.state.extensions > 0) {
          this.state.extensions--;
          let c = this.state.worker.extendManipulators();
          this.solution.attachNewManipulatorWithRelativeCoordinates(c.x, c.y);
        }

        // console.log(this.state.dump(true));
      }
    }

    return this.solution;
  }

  cost(state: State): number {
    let cost = 0;

    for (let i = 0; i < state.m.w * state.m.h; i++) {
      if (state.m.isFreeIndex(i)) {
        let n = state.m.getNeighbors(i);
        let blockedNeighbors = 4 - n.length;
        let wrappedNeighbors = 0;

        n.forEach(k => {
          if (state.m.isObstacleIndex(k)) blockedNeighbors++;
          if (state.m.isWrappedIndex(k)) wrappedNeighbors++;
        });

        cost += 1 + wrappedNeighbors * 0.1 + blockedNeighbors * 0.5;
      }
    }
    return cost;
  }
}
