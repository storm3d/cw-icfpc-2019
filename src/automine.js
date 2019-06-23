// @flow
import fs from 'fs';
import { execSync } from 'child_process';

const getLastBlockNumber = (): number => {
    let blocks = fs.readdirSync('./lambda-client/blocks/');

    blocks = blocks.map(b => parseInt(b, 10));

    return Math.max(...blocks);
};

const execSyncFailProofed = (cmd): string => {
    try {
        return execSync(cmd).toString().replace('\n', '');
    } catch (e) {
        console.error('--------------------------------------ERROR--------------------------------------');
        console.error(e.message);
        console.error('--------------------------------------ERROR--------------------------------------');

        return '';
    }
};

const getFormattedDate = () => new Date().toLocaleString();

const exec = (checkIntervalMinutes: number) => {
    let lastBlock = 0;

    const newLastBlock = getLastBlockNumber();
    const fn = () => {
        console.log(getFormattedDate(), 'Check...');

        if (newLastBlock === lastBlock) {
            return;
        }

        console.log(getFormattedDate(), '=====================================');
        console.log(getFormattedDate(), `New block detected: #${newLastBlock}`);
        execSyncFailProofed('yarn generate');
        console.log(getFormattedDate(), `Solution generated...`);
        lastBlock = newLastBlock;
        const t = execSyncFailProofed(
          'cd lambda-client && ' +
          `./lambda-cli.py submit ${newLastBlock} ` +
          `./blocks/${newLastBlock}/task.sol ./blocks/${newLastBlock}/puzzle_sol.desc`
        );
        console.log(getFormattedDate(), `Solution was submitted...`);
        console.log(getFormattedDate(), `Server response: ${t}`);
        console.log(getFormattedDate(), '=====================================');
    };

    console.log(getFormattedDate(), `Checking interval ${checkIntervalMinutes} minutes`);
    fn();
    setInterval(fn, checkIntervalMinutes * 60000);
};

if (process.send === undefined) {
    let checkIntervalMinutes = process.argv[2] ? parseInt(process.argv[2], 10) : 0.5;

    if (!checkIntervalMinutes || Number.isNaN(checkIntervalMinutes)) {
        checkIntervalMinutes = 0.5;
    }

    exec(checkIntervalMinutes);
}

module.exports = {
    exec
};
