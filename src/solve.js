// @flow

import {Solution} from "./model/solution";
import nearestFree from "./model/dijkstra";
import { State, DRILL_TIME } from "./model/model";

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
      let path = nearestFree(this.state, this.state.worker.pos, false);
      if (path === undefined)
        return this.solution;
    
      // dumb greedy drills
      if (this.state.drills > 0 && drillTurns == 0) {
          drilling = false;
          let path1 = nearestFree(this.state, this.state.worker.pos, true);
          if ((path1.length + 1 < path.lengh) && 
               path1.length < (drillTurns + this.state.drills * DRILL_TIME) ) {
              path = path1;
              this.state.drills--;
              this.solution.startUsingDrill();
              drillTurns = DRILL_TIME;
              drilling = truel
          }
      }
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
