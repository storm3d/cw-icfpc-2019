// @flow
import fs from 'fs';

import {State, OBSTACLE, FREE, Coord, Matrix, Booster} from '../model/model';
import { MapSerializer } from "./mapSerializer";

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
    boosters: Array<Booster>;
    boostersStr: string;

    iSqs : Array<Coord>;
    oSqs : Array<Coord>;

    constructor() {
        this.bNum = 0;
        this.eNum = 0;
        this.tSize = 0;
        this.vMin = this.vMax = this.mNum = this.fNum = this.dNum = this.rNum = this.cNum = this.xNum = 0;

        this.iSqs = [];
        this.oSqs = [];
        this.boosters = [];
        this.boostersStr = "";
    }

    static connectToBorder(s : State, source : Coord) {

        let lens = new Matrix(s.m.w, s.m.h);
        let front = new Array(source.getCopy());
        lens.set(source.x, source.y, 1);

        let nearestFilled : Coord = 0;

        while(front.length) {
            let c = front[0];
            let curLen = lens.get(c.x, c.y);

            //console.log(front);

            front.shift();

            let dirs = {
                0 : {
                    nx : c.x,
                    ny : c.y + 1,
                },
                3 : {
                    nx : c.x + 1,
                    ny : c.y,
                },
                6 : {
                    nx : c.x,
                    ny : c.y - 1,
                },
                9 : {
                    nx : c.x - 1,
                    ny : c.y,
                }
            };

            //console.log(dirs);
            let isFound = false;
            for (let dirsKey in dirs) {
                let nx = dirs[dirsKey].nx;
                let ny = dirs[dirsKey].ny;

                if(s.m.isValid(nx, ny)) {

                    if ((s.m.isObstacle(nx, ny) || nx === 0 || ny === 0
                        || nx === s.m.w - 1 || ny === s.m.h - 1)
                        && nearestFilled === 0) {
                        nearestFilled = new Coord(nx, ny);
                        isFound = true;
                        break;
                    }
                    if (s.m.isFree(nx, ny) && lens.get(nx, ny) === 0) {
                        front.push(new Coord(nx, ny));
                        lens.set(nx, ny, curLen + 1);
                    }
                }
            }

            if(isFound)
                break;
        }

        if(nearestFilled === 0)
            return undefined;

        let c = nearestFilled;

        while(true) {

            s.m.set(c.x, c.y, 1);

            let minL = 999999;
            let minC : Coord = 0;

            let dirs = {
                0 : {
                    nx : c.x,
                    ny : c.y + 1,
                },
                3 : {
                    nx : c.x + 1,
                    ny : c.y,
                },
                6 : {
                    nx : c.x,
                    ny : c.y - 1,
                },
                9 : {
                    nx : c.x - 1,
                    ny : c.y,
                }
            };

            let isFinished : boolean = false;
            for (let dirsKey in dirs) {
                let nx = dirs[dirsKey].nx;
                let ny = dirs[dirsKey].ny;

                if (source.x === nx && source.y === ny) {
                    isFinished = true;
                    break;
                }

                if (lens.get(nx, ny) < minL && lens.get(nx, ny) !== 0 && lens.isValid(nx, ny)) {
                    minL = lens.get(nx, ny);
                    minC = new Coord(nx, ny);
                }
            }

            if(isFinished)
                break;

            if(!minC)
                throw "Weird shit happened";

            c = minC.getCopy();
        }
        s.m.set(source.x, source.y, 1);
    }

    generateState() {
        let state = new State(this.tSize, this.tSize);

        this.iSqs.forEach(c => {
            state.m.set(c.x, c.y, 2);
        });

        this.oSqs.forEach(c => {
            Puzzle.connectToBorder(state, c);
        });

        const getFreePoint = function () {
            let result = [];
            for (let h = state.m.h - 1; h >= 0; h += 3) {
                for (let w = 0; w < state.m.w; w += 5) {
                    let c = state.m.get(w, h);
                    if (c === FREE) {
                        result = [w,h];
                        return result;
                    }
                }
            }
            return result;
        };
        // • mNum manipulator extensions
        // • fNum fast wheels,
        // • dNum drills,
        // • rNum teleports,
        // • cNum cloning boosters,
        // • xNum spawn points.

        [this.mNum, this.fNum, this.dNum, this.rNum, this.cNum, this.xNum].forEach((boosters, i) => {
            let types = ['B', 'F', 'L','R','C', 'X'];
            for (let b = 0; b < boosters; b++) {
                let freePoint = getFreePoint();
                const type = types[i];
                let booster = new Booster(freePoint[0], freePoint[1], type);
                state.m.set(freePoint[0], freePoint[1], i+3);
                this.boosters.push(booster);
                this.boostersStr += `${type}(${freePoint[0]},${freePoint[1]});`;
            }
        });

        let initialPoint = getFreePoint();
        state.workers[0].pos.x = initialPoint[0];
        state.workers[0].pos.y = initialPoint[1];

        return state;
    }

    addVertices (state, vertises) {
        const getFreePoint = function () {
            let result = [];
            for (let h = 0; h < state.m.h; h += 2) {
                for (let w = 0; w < state.m.w; w +=2) {
                    let c = state.m.get(w, h);
                    if (c === FREE && (state.m.getFreeNeighborsNum(w,h) === 5 || state.m.getFreeNeighborsNum(w,h) === 6)) {
                            result = [w,h];
                            return result;
                    }
                }
            }
            return result;
        };

        for(let i = 0; i < vertises + 10; i++) {
            let freePoint = getFreePoint();
            state.m.set(freePoint[0], freePoint[1], 1);
        }

        return state;
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
