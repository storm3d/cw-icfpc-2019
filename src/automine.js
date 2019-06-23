// @flow
import fs from 'fs';
import { execSync } from 'child_process';

const getLastBlockNumber = (): number => {
    let blocks = fs.readdirSync('./lambda-client/blocks/');

    blocks = blocks.map(b => parseInt(b, 10));

    return Math.max(...blocks);
};

const getFormattedDate = () => new Date().toLocaleString();

const CHECK_INTERVAL_MIN = 0.5;

const exec = () => {
    let lastBlock = 0;

    const newLastBlock = getLastBlockNumber();
    const fn = () => {
        console.log(getFormattedDate(), 'Check...');

        if (newLastBlock === lastBlock) {
            return;
        }

        console.log(getFormattedDate(), '=====================================');
        console.log(getFormattedDate(), `New block detected: #${newLastBlock}`);
        execSync('yarn generate');
        console.log(getFormattedDate(), `Solution generated...`);
        lastBlock = newLastBlock;
        const t = execSync(
          'cd lambda-client && ' +
          `./lambda-cli.py submit ${newLastBlock} ` +
          `./blocks/${newLastBlock}/task.sol ./blocks/${newLastBlock}/puzzle_sol.desc`
        );
        console.log(getFormattedDate(), `Solution was submitted...`);
        console.log(getFormattedDate(), `Server response: ${t.toString().replace('\n', '')}`);
        console.log(getFormattedDate(), '=====================================');
    };

    console.log(getFormattedDate(), `Checking interval ${CHECK_INTERVAL_MIN} minutes`);
    fn();
    setInterval(fn, CHECK_INTERVAL_MIN * 60000);

    // callback();
};

if (process.send === undefined) {
    exec();
}

module.exports = {
    exec
};
