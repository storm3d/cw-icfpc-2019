"use strict";

// import {read} from './io/read'
// import {write} from './io/write'
// import Solver from "./solve";

const exec = (inputFolder, outputFolder, num) => {
    // eslint-disable-next-line no-console
    console.log(inputFolder, outputFolder, num);
    // here we go
    // TODO: read here

    // TODO: solve here

    // TODO: write here
};

if (process.send === undefined) {
    exec('part-1-initial', "solutions", "001");
}

// msg it is the number of the task
process.on('message', msg => {
    // eslint-disable-next-line no-console
    console.log(msg);
    if (msg === 'kill') {
        process.exit(0);
    } else if (msg === 'ask') {
        if (process.send !== undefined) {
            process.send('message');
        }
    } else {
        exec('part-1-initial', 'solutions', msg);
    }
});

module.exports = {
    exec
};