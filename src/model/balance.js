// @flow
import {execSync} from 'child_process';

export class Balance {

    balance: number = 0;

    constructor() {
        this.loadBalance();
    }

    static execBalance(cmd: string): string {
        try {
            return execSync(cmd).toString().replace('\n', '');
        } catch (e) {
            console.error('--------------------------------------ERROR--------------------------------------');
            console.error(e.message);
            console.error('--------------------------------------ERROR--------------------------------------');

            return '';
        }
    }

    loadBalance(): number {
        const balance = Balance.execBalance(
            'cd lambda-client && ' +
            `./lambda-cli.py getbalances 52`
        );
        console.log(`Balance response: ${balance}`);
        this.balance = parseInt(balance, 10);


        return parseInt(balance, 10);
    }

    getBalance(): number {
        return this.balance;
    }

}