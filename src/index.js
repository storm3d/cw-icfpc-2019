// @flow
import {read} from './io/read'
import {write, Writer} from './io/write'
import {Matrix, WRAPPED} from "./model/model.js";
import {Solution} from "./model/solution.js";
import Solver from "./solve";
import {parseState} from "./model/model";

const exec = (model: string, callback: Function) => {

    const layout = `
        | . . . |
        | . # # |
        | . . . |
        | W . . |`;
    let s = parseState(layout);
    console.log(s.dump());

    let solver = new Solver(s);
    let solution = solver.solve();
    let writer = new Writer(solution);
    writer.write('solutions', model);

    callback();
};

if (process.send === undefined) {
    exec('001',() => 0);
}

module.exports = {
    exec
};
