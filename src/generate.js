// @flow
import { Puzzle, PuzzleParser } from "./model/puzzle";


const exec = (model: string, callback: Function) => {

    let filename = `./chain-puzzle-examples/puzzle.cond`;
    let puzzleParser = new PuzzleParser(filename);

    let puzzle = puzzleParser.getPuzzle();

    console.log(puzzle.bNum);

    callback();
};

if (process.send === undefined) {
    exec(0, () => 0);
}

module.exports = {
    exec
};
