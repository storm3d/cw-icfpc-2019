// @flow
import fs from 'fs';
import { Puzzle, PuzzleParser, PuzzleMap } from "./model/puzzle";
import MapSerializer from "./model/mapSerializer";


const exec = (model: string, callback: Function) => {

    // let filename = `./chain-puzzle-examples/puzzle.cond`;
    let filename = `./lambda-client/blocks/${model}/puzzle.cond`;
    let puzzleParser = new PuzzleParser(filename);

    let puzzle = puzzleParser.getPuzzle();
    let state = puzzle.generateState();

    let mapSerializer = new MapSerializer(state.m, state.worker);
    let serializedPath = mapSerializer.dump();
    let vertices = serializedPath.split('#')[0].split(",").length / 2;
    if (vertices < puzzle.vMin) {
        console.log("vertices", vertices);
        state = puzzle.addVertices(state, puzzle.vMin - vertices);
        mapSerializer = new MapSerializer(state.m, state.worker);
        serializedPath = mapSerializer.dump();
        vertices = serializedPath.split('#')[0].split(",").length / 2;
        console.log("========= new vertices =====", vertices);
    }
        serializedPath += puzzle.boostersStr.slice(0, -1);
        fs.writeFileSync(`.//lambda-client/blocks/${model}/puzzle_sol.desc`, serializedPath, 'utf8');


    callback();
};

if (process.send === undefined) {
    let blocks = fs.readdirSync("./lambda-client/blocks/");
    blocks = blocks.map(b => parseInt(b, 10));
    let lastBlock = Math.max(...blocks);
    exec(`${lastBlock}`, () => 0);
}

module.exports = {
    exec
};
