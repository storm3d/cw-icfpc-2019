// @flow
import {cpus} from "os";
// eslint-disable-next-line camelcase
import child_process from 'child_process'


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

    let models = Array.from({length: 150}, (v, k) => k + 1);

    for (let i = 0; i < numCPUs; i++) {
        let worker = child_process.fork("./dist/index.js");
        worker.send('ask');
        worker.on('message', (msg) => {
            // eslint-disable-next-line no-console
            console.log('Message from child', msg);
            if (models.length > 0) {
                let model = models.pop();
                worker.send(formatNum(model, 3));
            } else {
                worker.send('kill');
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