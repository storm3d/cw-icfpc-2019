// @flow
import {read} from './io/read'
import {write, Writer} from './io/write'
import {Matrix, WRAPPED} from "./model/model.js";
import {Solution} from "./model/solution.js";
import Solver from "./solve";
import {parseMatrix} from "./model/model";

const exec = (model: string, callback: Function) => {

    const layout = `
        | . # # |
        | . # # |
        | . . . |
        | x . . |`;
    let m = parseMatrix(layout);
    console.log(m.dump());

    let solver = new Solver();
    let solution = new Solution();
    solution.moveDown();
    solution.moveLeft();

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
