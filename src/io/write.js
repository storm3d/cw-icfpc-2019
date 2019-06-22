// @flow
import fs from 'fs'
import {Solution} from "../model/solution";

export class Writer {
    solution: Solution;

    constructor(solution: Solution) {
        this.solution = solution;
    }

    write(folder: string, model: string): number {
        let filename = `./${folder}/prob-${model}.sol`;

        return this.writeSolve(filename);

        /*
        let scorefile = `./scores/prob-${model}.sol`;

        if (!fs.existsSync(scorefile)) {
            this.writeScore(scorefile);

            return this.writeSolve(filename);
        }

        let savedScore = parseInt(fs.readFileSync(scorefile).toString(), 10);

        if (savedScore <= this.solution.getScore()) {
            this.writeScore(scorefile);

            return this.writeSolve(filename);
        }
        // eslint-disable-next-line no-console,no-console
        console.log('New solution get the worst results!');
        // eslint-disable-next-line no-console
        console.log(`SOLUTION ${model} WAS NOT UPDATED`);

        return this.solution.getString().length;
        */
    }

    writeSolve(filename: string): number {
        // eslint-disable-next-line no-console
        console.log(`Writing file ${filename}`);
        fs.writeFileSync(filename, this.solution.getString(), 'utf8');
        // eslint-disable-next-line no-console
        console.log(`The file ${filename} has been saved!`);

        return this.solution.getString().length;
    }

    writeScore(filename: string): number {
        fs.writeFileSync(filename, `${this.solution.getScore()}`);
        // eslint-disable-next-line no-console
        console.log(`The score file ${filename} has been updated!`);

        return this.solution.getScore();
    }
}