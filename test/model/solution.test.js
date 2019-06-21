import {  } from "../../src/model/solution";
import {Solution} from "../../src/model/solution";

describe("Solution", () => {
    test("Solution result", () => {

        let s = new Solution();
        s.moveUp();
        s.moveDown();
        s.moveLeft();
        s.moveRight();
        s.doNothing();
        s.turnManipulatorsClockwise();
        s.turnManipulatorsCounterclockwise();
        s.attachNewManipulatorWithRelativeCoordinates(2, 16);
        s.attachFastWheels();
        s.startUsingDrill();

        expect(s.solution()).toEqual("WSADZEQB(2, 16)FZ");
    })
});