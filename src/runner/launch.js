// @flow
import {cpus} from "os";
import {MANIPULATOR_PRICE} from "../constants/boosters";
import {Balance} from "../model/balance";

const {fork} = require('child_process');

const totalProblems = 300;
let lambdaBalance = 0;

function formatNum(num: number, size: number): string {
    let s = String(num);
    while (s.length < (size || 2)) {
        s = `0${s}`;
    }
    return s;
}

function getCoins(model: number): number {
    let c = 2;
    let spend = MANIPULATOR_PRICE * c;
    if (lambdaBalance > spend) {
        lambdaBalance -= spend;

        return spend;
    }

    return 0;
}

const launch = () => {
    let numCPUs = cpus().length;
    // eslint-disable-next-line no-console
    console.log('Before fork');

    let models = Array.from({length: totalProblems}, (v, k) => k + 1);

    let balance = new Balance();
    lambdaBalance = balance.getBalance();

    for (let i = 0; i < numCPUs; i++) {
        const forked = fork('./dist/fork.js');
        forked.send({type: 'start'});

        forked.on('message', (msg) => {
            // eslint-disable-next-line no-console
            console.log('Message from child:', msg);
            // eslint-disable-next-line no-console
            console.log('Models length:', models.length);
            if (msg.type === 'ask') {
                if (models.length > 0) {
                    let model = models.pop();
                    forked.send({type: 'model', model: formatNum(model, 3), 'coins': getCoins(model)});
                } else {
                    forked.send({type: 'kill'});
                }
            }
        });
    }
    // eslint-disable-next-line no-console
    console.log('After fork');
};

const launcher = () => {
    launch();
};

launcher();

module.exports = {
    launch, formatNum
};