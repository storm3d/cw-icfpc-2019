import {Solution} from "../../src/model/solution";

describe("Solution tests", () => {
    test("Move", () => {
        let sMove = new Solution();
        const move = "WDSA";
        sMove.moveUp();
        sMove.moveRight();
        sMove.moveDown();
        sMove.moveLeft();
        expect(sMove.solution()).toEqual(move);
    });
    test("Do nothing", () =>{
        const doN = "Z";
        let sDoNothing = new Solution();
        sDoNothing.doNothing();
        expect(sDoNothing.solution()).toEqual(doN);
    });
    test("Turn manipulators 90° clockwise", () => {
        const turn = "E";
        let sTurnCW = new Solution();
        sTurnCW.turnManipulatorsClockwise();
        expect(sTurnCW.solution()).toEqual(turn);
    });
    test("Turn manipulators 90° counterclockwise", () => {
        const turn = "Q";
        let sTurnCCW = new Solution();
        sTurnCCW.turnManipulatorsCounterclockwise();
        expect(sTurnCCW.solution()).toEqual(turn);
    });
    test("Attach a new manipulator with relative coordinates (dx, dy)", () =>{
        const newManipulator = "B(1,2)";
        let sNewM = new Solution();
        sNewM.attachNewManipulatorWithRelativeCoordinates(1,2);
        expect(sNewM.solution()).toEqual(newManipulator);
    });
    test("Attach fast wheels", () => {
        const wheels = "F";
        let sWheels = new Solution();
        sWheels.attachFastWheels();
        expect(sWheels.solution()).toEqual(wheels);
    });
    test("Start using a drill", () => {
        const drill = "L";
        let sDrill = new Solution();
        sDrill.startUsingDrill();
        expect(sDrill.solution()).toEqual(drill);
    });
});
