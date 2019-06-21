// @flow
import {read} from './io/read'
import {write} from './io/write'
import Solver from "./solve";

const exec = (inputFolder: string, outputFolder: string, num: string) => {

};

if (process.send === undefined) {
    //exec('problemsF', "solveF", "010");
}

process.on('message', (msg) => {
    /*if (msg === 'kill') {
        process.exit(0);
    } else if (msg === 'ask') {
        if (process.send !== undefined) {
            process.send('message');
        }
    } else {
        exec('problemsF', 'solveF', msg);
    }*/
});

module.exports = {
    exec
};
