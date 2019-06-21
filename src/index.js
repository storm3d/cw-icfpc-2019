// @flow
import {read, Reader} from './io/read'
import {write, Writer} from './io/write'
import {Matrix, WRAPPED} from "./model/model.js";
import {Solution} from "./model/solution.js";
import Solver from "./solve";
import {Coord, FREE, OBSTACLE, parseState, State} from "./model/model";
import MapParser from "./model/mapParser";

const exec = (model: string, callback: Function) => {

    // const layout = `
    //     | . . . |
    //     | . # # |
    //     | . . . |
    //     | W . . |`;
    // let s = parseState(layout);
    // console.log(s.dump());

    let reader = new Reader('problems',model);
    let s = reader.read();

    // console.log(s.dump());

    let solver = new Solver(s);
    let solution = solver.solve();

    let writer = new Writer(solution);
    writer.write('solutions', model);

    callback();
};

const highload = () => {
    let start = new Date();
    let size = 800;
    let s = new State(size, size);
    s.workerPos = new Coord(1, 1);
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size; i++) {
            if (Math.random() < 0.90 || (i === 1 && j === 1)) {
                s.m.set(i, j, FREE);
            } else {
                s.m.set(i,j, OBSTACLE)
            }
        }
    }
    console.log(s.dump());

    let solver = new Solver(s);
    let solution = solver.solve();
    let writer = new Writer(solution);

    writer.write('solutions', '001');
    let end = new Date() - start;
    console.info('Execution time: %dms', end)

};

if (process.send === undefined) {
    //for(let i = 1; i <= 150; i++)
        exec((2+"").padStart(3, "0"), () => 0);
    // highload()
}

module.exports = {
    exec
};
