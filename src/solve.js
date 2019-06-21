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
      let path = nearestFree(this.state.m, this.state.workerPos);
      if (path === undefined)
        return this.solution;

      console.log(path);

      for (let i = 0; i < path.length; i++) {
        this.solution.move(this.state.workerPos, path[i]);
        this.state.moveWorker(path[i]);
      }
    }

    return this.solution;
  }

}
