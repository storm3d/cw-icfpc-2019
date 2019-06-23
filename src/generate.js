// @flow
import fs from 'fs';
import { Puzzle, PuzzleParser, PuzzleMap } from "./model/puzzle";
import MapSerializer from "./model/mapSerializer";


const exec = (model: string, callback: Function) => {

    // let filename = `./chain-puzzle-examples/puzzle.cond`;
    let filename = `./lambda-client/blocks/0/puzzle.cond`;
    let puzzleParser = new PuzzleParser(filename);

    let puzzle = puzzleParser.getPuzzle();
    let state = puzzle.generateState();

    const mapSerializer = new MapSerializer(state.m, state.worker);
    let serializedPath = mapSerializer.dump();
    let vertices = serializedPath.split('#')[0].split(",").length / 2;
    if (vertices < puzzle.vMin) {
        // TODO: ADD VERTICES
    } else {
        serializedPath += puzzle.boostersStr.slice(0, -1);
        fs.writeFileSync(".//lambda-client/blocks/0/puzzle_sol.desc", serializedPath, 'utf8');
    }

    callback();
};

if (process.send === undefined) {
    exec(0, () => 0);
}

module.exports = {
    exec
};
