import {Coord} from "./model.js";
export class Solution {
    result = "";

    move(first, second: Coord) {
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
    }

    moveDown() {
        this.result += "S";
    }

    moveLeft() {
        this.result += "A";
    }

    moveRight() {
        this.result += "D";
    }

    doNothing() {
        this.result += "Z"
    }

    turnManipulatorsClockwise() {
        this.result += "E"
    }

    turnManipulatorsCounterclockwise() {
        this.result += "Q"
    }

    attachNewManipulatorWithRelativeCoordinates(x: number, y: number) {
        this.result += "B(" + x + "," + y + ")"
    }

    attachFastWheels() {
        this.result += "F"
    }

    startUsingDrill() {
        this.result += "L"
    }

    solution() {
        return this.result
    }
}