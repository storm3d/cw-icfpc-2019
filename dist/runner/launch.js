'use strict';

var _os = require('os');

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function formatNum(num, size = 2) {
    let s = String(num);
    while (s.length < (size || 2)) {
        s = `0${s}`;
    }
    return s;
}
// eslint-disable-next-line camelcase


const launch = () => {
    let numCPUs = (0, _os.cpus)().length;
    // eslint-disable-next-line no-console
    console.log('Before fork');

    let models = Array.from({ length: 150 }, (v, k) => k + 1);

    for (let i = 0; i < numCPUs; i++) {
        let worker = _child_process2.default.fork("./dist/index.js");
        worker.send('ask');
        worker.on('message', msg => {
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
    console.log('After fork');
};

const launcher = () => {
    launch();
};

launcher();

module.exports = {
    launch
};