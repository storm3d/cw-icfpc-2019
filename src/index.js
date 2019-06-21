// @flow
import {read} from './io/read'
import {write} from './io/write'
import {Matrix, WRAPPED} from "./model/model.js";
import {Solution} from "./model/solution.js";
import Solver from "./solve";
import { parseMatrix } from "./model/model";

const exec = (callback: Function) => {

    const layout = `
        | . # # |
        | . # # |
        | . . . |
        | x . . |`;
    let m = parseMatrix(layout);
    console.log(m.dump());

    let solver = new Solver();

    callback();
};

if (process.send === undefined) {
    exec(() => 0);
}

module.exports = {
    exec
};
