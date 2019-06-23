// @flow
import {Coord} from "./model";

export class Solution {

    results: Array<string>;
    score: number;
    workerId : number;

    constructor(result: String = undefined, score?: number) {
        this.results = result ? [ result ] : [ "" ];
        this.score = score ? score : 0;
        this.workerId = 0;
    }

    //getCopy() {
      //  new Solution(this.result);
    //}


    setWorkerId(id : number) {
        if(id >= this.results.length)
            throw "No such worker";
        this.workerId = id;
    }

    addWorker() {
        this.results.push('');
    }

    move(first: Coord, second: Coord) {
        let diff = first.getDiff(second);

        if (diff.x === 1 && diff.y === 0) {
            this.moveRight()
        }
        else if (diff.x === -1 && diff.y === 0) {
            this.moveLeft()
        }
        else if (diff.x === 0 && diff.y === 1) {
            this.moveUp()
        }
        else if (diff.x === 0 && diff.y === -1) {
            this.moveDown()
        } else {
          throw `NO TURN FOR ${first} ${second}`;
        }
    }

    moveUp() {
        this.results[this.workerId] += "W";
        this.score++;
    }

    moveDown() {
        this.results[this.workerId] += "S";
        this.score++;
    }

    moveLeft() {
        this.results[this.workerId] += "A";
        this.score++;
    }

    moveRight() {
        this.results[this.workerId] += "D";
        this.score++;
    }

    doNothing() {
        this.results[this.workerId] += "Z";
        this.score++;
    }

    turnManipulatorsClockwise() {
        this.results[this.workerId] += "E";
        this.score++;
    }

    turnManipulatorsCounterclockwise() {
        this.results[this.workerId] += "Q";
        this.score++;
    }

    attachNewManipulatorWithRelativeCoordinates(x: number, y: number) {
        this.results[this.workerId] += `B(${x},${y})`;
        this.score++;
    }

    attachFastWheels() {
        this.results[this.workerId] += "F";
        this.score++;
    }

    startUsingDrill() {
        this.results[this.workerId] += "L";
        this.score++;
    }

    plantTeleport() {
        this.results[this.workerId] += "R";
        this.score++;
    }

    skipTurn() {
        this.results[this.workerId] += "Z";
        this.score++;
    }

    activateTeleport(x: number, y: number) {
        this.results[this.workerId] += `T(${x},${y})`;
        this.score++;
    }

    activateCloning() {
        this.results[this.workerId] += `C`;
        this.score++;
    }

    getString() {
        let str = "";
        for(let i = 0; i < this.results.length; i++) {
            str += this.results[i];
            if(i !== this.results.length - 1)
                str += '#';
        }
        return str;
    }

    getScore() {
        return this.score;
    }
}