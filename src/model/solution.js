// @flow
import {Coord} from "./model";

export class Solution {
    result: string;
    score: number;

    constructor(result: String = undefined, score?: number) {
        this.result = result ? result : "";
        this.score = score ? score : 0;
    }

    getCopy() {
        new Solution(this.result);
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
        this.result += "W";
        this.score++;
    }

    moveDown() {
        this.result += "S";
        this.score++;
    }

    moveLeft() {
        this.result += "A";
        this.score++;
    }

    moveRight() {
        this.result += "D";
        this.score++;
    }

    doNothing() {
        this.result += "Z";
        this.score++;
    }

    turnManipulatorsClockwise() {
        this.result += "E";
        this.score++;
    }

    turnManipulatorsCounterclockwise() {
        this.result += "Q";
        this.score++;
    }

    attachNewManipulatorWithRelativeCoordinates(x: number, y: number) {
        this.result += `B(${x},${y})`;
        this.score++;
    }

    attachFastWheels() {
        this.result += "F";
        this.score++;
    }

    startUsingDrill() {
        this.result += "L";
        this.score++;
    }

    plantTeleport() {
        this.result += "R";
        this.score++;
    }

    skipTurn() {
        this.result += "Z";
        this.score++;
    }

    activateTeleport(x: number, y: number) {
        this.result += `T(${x},${y})`;
        this.score++;
    }

    getString() {
        return this.result;
    }

    getScore() {
        return this.score;
    }
}