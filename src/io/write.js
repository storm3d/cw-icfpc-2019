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
        // eslint-disable-next-line no-console
        console.log(`Writing file ${filename}`);
        fs.writeFileSync(filename, this.solution.getString(), 'utf8');
        let scoreStr = `${this.solution.getScore()};`;
        fs.appendFileSync('./current_result.txt', scoreStr)
        // eslint-disable-next-line no-console
        console.log(`The file ${filename} has been saved!`);

        return this.solution.getString().length;
    }
}