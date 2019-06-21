// @flow
// import {read} from './io/read'
// import {write} from './io/write'
// import Solver from "./solve";

import {formatNum} from "./runner/launch";

const exec = (inputFolder: string, outputFolder: string, num: string) => {
    // eslint-disable-next-line no-console
    console.log(inputFolder, outputFolder, num);
    // here we go
    // TODO: read here

    // TODO: solve here

    // TODO: write here
};

if (process.send === undefined) {
    let models = Array.from({length: 150}, (v, k) => k + 1);
    while (models.length > 0) {
        let model = models.pop();
        let modelname = formatNum(model, 3);
        // exec('part-1-initial', "solutions", modelname);
    }
}

// msg it is the number of the task
process.on('message', (msg) => {
//     // eslint-disable-next-line no-console
//     console.log(msg);
//     if (msg === 'kill') {
//         process.exit(0);
//     } else if (msg === 'ask') {
        if (process.send !== undefined) {
            process.send('message');
        }
//     } else {
//         exec('part-1-initial', 'solutions', msg);
//     }
});

module.exports = {
    exec
};
