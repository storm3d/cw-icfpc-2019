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
        fs.writeFileSync(filename, this.solution.solution(), 'utf8');
        // eslint-disable-next-line no-console
        console.log(`The file ${filename} has been saved!`);

        return this.solution.solution().length;
    }
}