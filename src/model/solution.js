// @flow
export class Solution {
    result: string = "";

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