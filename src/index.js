// @flow
import {read} from './io/read'
import {write} from './io/write'
import {Matrix, WRAPPED} from "./model/model.js";
import Solver from "./solve";

const exec = () => {
    console.log(2);
    let m = new Matrix(15, 6);
    m.set(0, 0, WRAPPED);
    console.log(2.5);
    console.log(m.dump());
    console.log(3);
};

if (process.send === undefined) {

    exec();
}


module.exports = {
    exec
};
