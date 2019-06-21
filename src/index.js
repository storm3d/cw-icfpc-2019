// @flow
import {read} from './io/read'
import {write} from './io/write'
import {Matrix, WRAPPED} from "./model/model.js";
import {Solution} from "./model/solution.js";
import Solver from "./solve";

const exec = () => {
    console.log(2);
    let m = new Matrix(10, 10);
    m.set(0, 0, WRAPPED);
    console.log(2.5);
    console.log(m.dump());
    console.log(3);


    let s = new Solution();
    s.moveUp();
    s.moveDown();
    s.moveLeft();
    s.moveRight();
    s.doNothing();
    s.turnManipulatorsClockwise();
    s.turnManipulatorsCounterclockwise();
    s.attachNewManipulatorWithRelativeCoordinates(2, 16);
    s.attachFastWheels();
    s.startUsingDrill();

    console.log(s.solution());
};

if (process.send === undefined) {

    exec();
}


module.exports = {
    exec
};
