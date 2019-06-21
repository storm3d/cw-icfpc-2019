// @flow

import * as model from "./model/model";
import {Solution} from "./model/solution.js";

export default class Solver {

  state : State;
  solution : Solution;

  constructor(state : State) {
    this.state = state;
    this.solution = new Solution();
  }

  solve() {
    return this.solution;
  }

}
