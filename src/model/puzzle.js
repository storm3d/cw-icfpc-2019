// @flow
import fs from 'fs'

import { State, OBSTACLE, FREE, Coord } from '../model/model'

const COORDS_REGEXP = /\([0-9]+,[0-9]+\)/g;

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
        let components = this.content.split('#')
        // console.log(components)
        const [bNum, eNum, tSize, vMin, vMax, mNum, fNum, dNum,rNum,cNum, xNum] = components[0].split(",")
        this.puzzle = new Puzzle();
        this.puzzle.bNum = parseInt(bNum,10);
        this.puzzle.eNum = parseInt(eNum,10);
        this.puzzle.tSize = parseInt(tSize,10);
        this.puzzle.vMin = parseInt(vMin,10);
        this.puzzle.vMax = parseInt(vMax,10);
        this.puzzle.mNum = parseInt(mNum,10);
        this.puzzle.fNum = parseInt(fNum,10);
        this.puzzle.dNum = parseInt(dNum,10);
        this.puzzle.rNum = parseInt(rNum,10);
        this.puzzle.cNum = parseInt(cNum,10);
        this.puzzle.xNum = parseInt(xNum,10);
        if (components[1] && components[1].match(COORDS_REGEXP) && components[1].match(COORDS_REGEXP).length) {
            this.puzzle.iSqs = components[1].match(COORDS_REGEXP).map((str) => {
                const t = str.split(',');
                const x = parseInt(t[0].slice(1), 10);
                const y = parseInt(t[1].slice(0, -1), 10);
                return new Coord(x,y)
            });
        }
        if (components[2] && components[2].match(COORDS_REGEXP) && components[1].match(COORDS_REGEXP).length) {
            this.puzzle.oSqs = components[2].match(COORDS_REGEXP).map((str) => {
                const t = str.split(',');
                const x = parseInt(t[0].slice(1), 10);
                const y = parseInt(t[1].slice(0, -1), 10);
                return new Coord(x,y)
            });
        }

        return this.puzzle;
    }
}
