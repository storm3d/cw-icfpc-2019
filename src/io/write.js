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

        let scorefile = `./scores/prob-${model}.score`;

        if (!fs.existsSync(scorefile)) {
            this.writeScore(scorefile);

            return this.writeSolve(filename, model);
        }

        let DEBUG = true;
        let savedScore = parseInt(fs.readFileSync(scorefile).toString(), 10);

        if (DEBUG || savedScore <= this.solution.getScore()) {
            this.writeScore(scorefile);

            return this.writeSolve(filename, model);
        }
        // eslint-disable-next-line no-console,no-console
        console.log('New solution get the worst results!');
        // eslint-disable-next-line no-console
        console.log(`SOLUTION ${model} WAS NOT UPDATED`);

        return this.solution.getString().length;
    }

    writeSolve(filename: string, model:string): number {
        // eslint-disable-next-line no-console
        console.log(`Writing file ${filename}`);
        fs.writeFileSync(filename, this.solution.getString(), 'utf8');
        let scoreStr = `${model}:${this.solution.getScore()};`;
        fs.appendFileSync('./current_result.txt', scoreStr)
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