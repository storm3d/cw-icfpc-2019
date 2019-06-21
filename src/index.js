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

    let reader = new Reader('part-1-initial',model);
    let s = reader.read();

    console.log(s.dump());

    let solver = new Solver(s);
    let solution = solver.solve();

    let writer = new Writer(solution);
    writer.write('solutions', model);

    callback();
};

const highload = () => {
    let start = new Date();
    let s = new State(400, 400);
    s.workerPos = new Coord(1, 1);
    for (let j = 0; j < 400; j++) {
        for (let i = 0; i < 400; i++) {
            if (Math.random() < 0.95 || (i === 1 && j === 1)) {
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
    exec('001', () => 0);
    // highload()
}

module.exports = {
    exec
};
