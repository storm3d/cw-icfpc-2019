// @flow

import {Solution} from "./model/solution";
import nearestFree from "./model/dijkstra";
import { State } from "./model/model";

export default class Solver {

  state : State;
  solution : Solution;

  constructor(state : State) {
    this.state = state;
    this.solution = new Solution();
  }

  solve(): Solution {

    while(true) {
      let path = nearestFree(this.state, this.state.worker.pos);
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
        // console.log(this.state.dump(true));
      }
    }

    return this.solution;
  }

}
