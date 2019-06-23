// @flow
import {execSync} from 'child_process';

export class Balance {

    balance: number = 0;

    constructor() {
        this.loadBalance();
    }

    static execBalance(cmd): string {
        return execSync(cmd).toString().replace('\n', '');
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