import { Coord } from "../../src/model/model";
import { Puzzle, PuzzleParser } from "../../src/model/puzzle";

describe("Parse Puzzle", () => {
    test("Should read content", () => {
        let puzzleParser = new PuzzleParser(null,"5,1,150,400,1200,6,10,5,1,3,4#(1,1)#(2,2)");
        let puzzle = puzzleParser.getPuzzle();

        expect(puzzle.bNum).toEqual(5);
        expect(puzzle.eNum).toEqual(1);
        expect(puzzle.tSize).toEqual(150);
        expect(puzzle.vMin).toEqual(400);
        expect(puzzle.vMax).toEqual(1200);
        expect(puzzle.mNum).toEqual(6);
        expect(puzzle.fNum).toEqual(10);
        expect(puzzle.dNum).toEqual(5);
        expect(puzzle.rNum).toEqual(1);
        expect(puzzle.cNum).toEqual(3);
        expect(puzzle.xNum).toEqual(4);
        expect(puzzle.iSqs.length).toEqual(1);
        expect(puzzle.iSqs[0]).toEqual(new Coord(1,1));
    });
    test("Should read file", () => {
        let puzzleParser = new PuzzleParser("./chain-puzzle-examples/puzzle.cond");
        let puzzle = puzzleParser.getPuzzle();

        expect(puzzle.bNum).toEqual(1);
        expect(puzzle.eNum).toEqual(1);
        expect(puzzle.tSize).toEqual(150);
        expect(puzzle.vMin).toEqual(400);
        expect(puzzle.vMax).toEqual(1200);
        expect(puzzle.iSqs.length).toEqual(50);
        expect(puzzle.iSqs[0]).toEqual(new Coord(73,61));
        expect(puzzle.oSqs[0]).toEqual(new Coord(145,82));
    });

    test("Shouldn't break if coords don't exist", () => {
        let puzzleParser = new PuzzleParser(null,"1,1,150,400,1200,6,10,5,1,3,4#sdfsdfsd");
        let puzzle = puzzleParser.getPuzzle();

        expect(puzzle.bNum).toEqual(1);
        expect(puzzle.eNum).toEqual(1);
        expect(puzzle.tSize).toEqual(150);
        expect(puzzle.vMin).toEqual(400);
        expect(puzzle.vMax).toEqual(1200);
        expect(puzzle.iSqs.length).toEqual(0);
        expect(puzzle.oSqs.length).toEqual(0);
    });

});
