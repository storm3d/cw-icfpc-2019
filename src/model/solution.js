// @flow
import {Coord} from "./model.js";

export class Solution {
    result: string = "";
    score: number = 0;

    move(first: Coord, second: Coord) {
        let diff = first.getDiff(second);

        if (diff.x === 1 && diff.y === 0) {
            this.moveRight()
        }
        if (diff.x === -1 && diff.y === 0) {
            this.moveLeft()
        }
        if (diff.x === 0 && diff.y === 1) {
            this.moveUp()
        }
        if (diff.x === 0 && diff.y === -1) {
            this.moveDown()
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
        this.result += "E"
        this.score++;
    }

    turnManipulatorsCounterclockwise() {
        this.result += "Q"
        this.score++;
    }

    attachNewManipulatorWithRelativeCoordinates(x: number, y: number) {
        this.result += "B(" + x + "," + y + ")"
        this.score++;
    }

    attachFastWheels() {
        this.result += "F"
        this.score++;
    }

    startUsingDrill() {
        this.result += "L"
        this.score++;
    }

    getString() {
        return this.result
    }

    getScore() {
        return this.score
    }
}