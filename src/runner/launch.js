// @flow
import {cpus} from "os";

const {fork} = require('child_process');


function formatNum(num: number, size: number): string {
    let s = String(num);
    while (s.length < (size || 2)) {
        s = `0${s}`;
    }
    return s;
}

const launch = () => {
    let numCPUs = cpus().length;
    // eslint-disable-next-line no-console
    console.log('Before fork');

    let models = Array.from({length: 3}, (v, k) => k + 1);

    for (let i = 0; i < numCPUs; i++) {
        const forked = fork('./dist/fork.js');
        forked.send({type: 'start'});

        forked.on('message', (msg) => {
            console.log('Message from child:', msg);
            console.log('Models length:', models.length);
            if (msg.type === 'ask') {
                if (models.length > 0) {
                    let model = models.pop();
                    forked.send({type: 'model', model: formatNum(model, 3)});
                } else {
                    forked.send({type: 'kill'})
                }
            }
        });
    }
    // eslint-disable-next-line no-console
    console.log('After fork')
};

const launcher = () => {
    launch();
};

launcher();

module.exports = {
    launch, formatNum
};