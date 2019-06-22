import { Coord } from "../../src/model/model";
import { Puzzle, PuzzleParser } from "../../src/model/puzzle";

describe("Parse Puzzle", () => {
    test("Should read content", () => {
        let puzzleParser = new PuzzleParser(null,"1,1,150,400,1200,6,10,5,1,3,4#(1,1)#(2,2)");
        let puzzle = puzzleParser.getPuzzle();

        expect(puzzle.bNum).toEqual(1);
        expect(puzzle.eNum).toEqual(1);
        expect(puzzle.tSize).toEqual(150);
        expect(puzzle.vMin).toEqual(400);
        expect(puzzle.vMax).toEqual(1200);
        expect(puzzle.iSqs.length).toEqual(1);
        expect(puzzle.iSqs[0]).toEqual(new Coord(1,1));
    });

});
