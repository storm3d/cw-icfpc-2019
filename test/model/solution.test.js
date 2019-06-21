import {Solution} from "../../src/model/solution";
import {Coord} from "../../src/model/model";

describe("Solution tests", () => {
    test("Move", () => {
        let sMove = new Solution();
        const move = "WDSA";
        sMove.moveUp();
        sMove.moveRight();
        sMove.moveDown();
        sMove.moveLeft();
        expect(sMove.getString()).toEqual(move);
    });
    test("Do nothing", () =>{
        const doN = "Z";
        let sDoNothing = new Solution();
        sDoNothing.doNothing();
        expect(sDoNothing.getString()).toEqual(doN);
    });
    test("Turn manipulators 90° clockwise", () => {
        const turn = "E";
        let sTurnCW = new Solution();
        sTurnCW.turnManipulatorsClockwise();
        expect(sTurnCW.getString()).toEqual(turn);
    });
    test("Turn manipulators 90° counterclockwise", () => {
        const turn = "Q";
        let sTurnCCW = new Solution();
        sTurnCCW.turnManipulatorsCounterclockwise();
        expect(sTurnCCW.getString()).toEqual(turn);
    });
    test("Attach a new manipulator with relative coordinates (dx, dy)", () =>{
        const newManipulator = "B(1,2)";
        let sNewM = new Solution();
        sNewM.attachNewManipulatorWithRelativeCoordinates(1,2);
        expect(sNewM.getString()).toEqual(newManipulator);
    });
    test("Attach fast wheels", () => {
        const wheels = "F";
        let sWheels = new Solution();
        sWheels.attachFastWheels();
        expect(sWheels.getString()).toEqual(wheels);
    });
    test("Start using a drill", () => {
        const drill = "L";
        let sDrill = new Solution();
        sDrill.startUsingDrill();
        expect(sDrill.getString()).toEqual(drill);
    });
    test("Should move right", () => {
        const drill = "D";
        let solution = new Solution();
        let first = new Coord(0, 0)
        let second = new Coord(1, 0)
        solution.move(first, second)
        expect(solution.getString()).toEqual(drill);
    });
    test("Should move left", () => {
        const drill = "A";
        let solution = new Solution();
        let first = new Coord(1, 0)
        let second = new Coord(0, 0)
        solution.move(first, second)
        expect(solution.getString()).toEqual(drill);
    });
    test("Should move up", () => {
        const drill = "W";
        let solution = new Solution();
        let first = new Coord(0, 0)
        let second = new Coord(0, 1)
        solution.move(first, second)
        expect(solution.getString()).toEqual(drill);
    });
    test("Should move down", () => {
        const drill = "S";
        let solution = new Solution();
        let first = new Coord(0, 1)
        let second = new Coord(0, 0)
        solution.move(first, second)
        expect(solution.getString()).toEqual(drill);
    });
});

