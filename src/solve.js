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
      let path = nearestFree(this.state.m, this.state.worker.pos);
      if (path === undefined)
        return this.solution;

      // console.log(path);

      let pathLen = path.length > 1 ? path.length - 1 : path.length;
      for (let i = 0; i < pathLen; i++) {
        this.solution.move(this.state.worker.pos, path[i]);
        this.state.moveWorker(path[i]);
        // console.log(this.state.dump(true));
      }
    }

    return this.solution;
  }

}
