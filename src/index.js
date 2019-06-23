// @flow
import {read, Reader} from './io/read'
import {write, Writer} from './io/write'
import {Matrix, WRAPPED} from "./model/model.js";
import {Solution} from "./model/solution.js";
import Solver from "./solve";
import {Coord, FREE, OBSTACLE, parseState, State} from "./model/model";
import MapParser from "./model/mapParser";

let totalSteps = 0;
let boostersStats = {};

const exec = (model: string, callback: Function, coins: number = 0) => {
    const reader = new Reader('problems',model);
    const s = reader.read();

    const solver = new Solver(s);
    solver.setCoins(coins);
    let startExtensions = solver.state.extensions;
    let solution = solver.solve();

    totalSteps += solution.getScore();

    /*
    solver.state.startingBoosters.forEach(b => {
        if(!boostersStats[b.type])
            boostersStats[b.type] = 1;
        else
            boostersStats[b.type]++;
    });
     */

    let writer = new Writer(solution, startExtensions);
    writer.write('solutions', model);

    callback();
};

if (process.send === undefined) {

    let mapsNum = 155;
    for(let i = 155; i <= mapsNum; i++) {
        exec((i + "").padStart(3, "0"), () => 0);

        console.log("Total score: " + totalSteps);

        /*
        for (let k in boostersStats){
            if (boostersStats.hasOwnProperty(k)) {
                console.log("Booster per map" + k + " " + boostersStats[k]/mapsNum);
            }
        }
        console.log(boostersStats);

         */
    }
}

module.exports = {
    exec
};
