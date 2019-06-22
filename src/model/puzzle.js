// @flow
import fs from 'fs'

import { State, OBSTACLE, FREE, Coord } from '../model/model'

export class Puzzle {

    bNum : number;
    eNum : number;
    tSize : number;
    vMin : number;
    vMax : number;
    mNum : number;
    fNum : number;
    dNum : number;
    rNum : number;
    cNum : number;
    xNum : number;

    iSqs : Array<Coord>;
    oSqs : Array<Coord>;

    constructor() {
        this.bNum = 0;
        this.eNum = 0;
        this.tSize = 0;
        this.vMin = this.vMax = this.mNum = this.fNum = this.dNum = this.rNum = this.cNum = this.xNum = 0;

        this.iSqs = [];
        this.oSqs = [];
    }
}

export class PuzzleParser {
    iSqs: Array<Array<number>> = [];
    oSqs: Array<Array<number>> = [];
    path: string;
    puzzle: Puzzle;
    content: string;

    constructor(filename: string, content : string = "") {

        if(content !== "") {
            this.content = content;
        }
        else {
            this.content = fs.readFileSync(filename).toString();
        }
    }

    getPuzzle(): Puzzle {
        this.puzzle = new Puzzle();
        return this.puzzle;
    }
}