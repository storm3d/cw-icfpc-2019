// @flow
import fs from 'fs';
import {Solution} from "../model/solution";
import {MANIPULATOR_LETTER, MANIPULATOR_PRICE} from "../constants/boosters";

export class Writer {
    solution: Solution;
    startExtensions: number;
    buyfile: string;

    constructor(solution: Solution, startExtensions: number) {
        this.solution = solution;
        this.startExtensions = startExtensions;
    }

    write(folder: string, model: string, customPath: string | null = null, omitScore: boolean = false): number {
        let filename = customPath || `./${folder}/prob-${model}.sol`;
        let scorefile = `./scores/prob-${model}.score`;

        this.buyfile = `./${folder}/prob-${model}.buy`;

        if (!fs.existsSync(scorefile)) {
            this.writeScore(scorefile);

            return this.writeSolve(filename, model);
        }

        let DEBUG = true;
        let savedScore = parseInt(fs.readFileSync(scorefile).toString(), 10);

        if (DEBUG || savedScore <= this.solution.getScore()) {
            if (omitScore !== true) {
                this.writeScore(scorefile);
            }

            return this.writeSolve(filename, model);
        }
        // eslint-disable-next-line no-console,no-console
        console.log('New solution get the worst results!');
        // eslint-disable-next-line no-console
        console.log(`SOLUTION ${model} WAS NOT UPDATED`);

        return this.solution.getString().length;
    }

    writeSolve(filename: string, model: string): number {
        // eslint-disable-next-line no-console
        console.log(`Writing file ${filename}`);
        fs.writeFileSync(filename, this.solution.getString(), 'utf8');
        let scoreStr = `${model}:${this.solution.getScore()};`;
        fs.appendFileSync('./current_result.txt', scoreStr)
        // eslint-disable-next-line no-console
        console.log(`The file ${filename} has been saved!`);

        this.writeExtensions();

        return this.solution.getString().length;
    }

    writeScore(filename: string): number {
        fs.writeFileSync(filename, `${this.solution.getScore()}`);
        // eslint-disable-next-line no-console
        console.log(`The score file ${filename} has been updated!`);

        return this.solution.getScore();
    }

    writeExtensions() {
        if (this.startExtensions > 0) {
            // console.log(`Writing file ${this.buyfile}`);
            let extensions = '';
            // console.log(`Count of extensions: ${this.startExtensions}`);
            while (this.startExtensions > 0) {
                extensions += MANIPULATOR_LETTER;
                this.startExtensions = this.startExtensions - 1;
            }
            console.log(`Buying extensions: ${extensions}`);
            fs.writeFileSync(this.buyfile, extensions);
            // console.log(`The file ${this.buyfile} has been saved!`);
        }
    }
}