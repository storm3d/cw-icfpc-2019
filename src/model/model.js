// @flow

export const FREE = 0;
export const OBSTACLE = 1;
export const WRAPPED = 2;

export const FAST_TIME = 50;
export const DRILL_TIME = 30;

export class Coord {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  isEqual(c: Coord): boolean {
    return this.x === c.x && this.y === c.y;
  }

  isEqualXY(x: number, y: number): boolean {
    return this.x === x && this.y === y;
  }

  getAdded(v: Coord) {
    return new Coord(this.x + v.x, this.y + v.y);
  }

  getDiff(v: Coord) {
    return new Coord(v.x - this.x, v.y - this.y);
  }

  getCenter() {
    return new Coord(this.x + 0.5, this.y + 0.5);
  }

  isEqual(c : Coord) {
    return this.x === c.x && this.y === c.y;
  }

  getCopy() {
    return new Coord(this.x, this.y);
  }

  rotCW(): Coord {
    return new Coord(this.y, this.x == 0 ? 0 : -this.x);
  }

  rotCCW(): Coord {
    return new Coord(this.y == 0 ? 0 : -this.y, this.x);
  }

  isObstacleCrossed(to, testedCoord: Coord) {
    let fromC = this.getCenter();
    let toC = to.getCenter();

    return this.getPointOfIntersection(fromC, toC,
      testedCoord, new Coord(testedCoord.x + 1, testedCoord.y))
        ||
        this.getPointOfIntersection(fromC, toC,
          testedCoord, new Coord(testedCoord.x, testedCoord.y + 1))
        ||
        this.getPointOfIntersection(fromC, toC,
          new Coord(testedCoord.x + 1, testedCoord.y),
          new Coord(testedCoord.x + 1, testedCoord.y + 1))
        ||
        this.getPointOfIntersection(fromC, toC,
          new Coord(testedCoord.x, testedCoord.y + 1),
          new Coord(testedCoord.x + 1, testedCoord.y + 1));
  }

  getPointOfIntersection(start1:Coord, end1:Coord, start2:Coord, end2:Coord) {
    let vector1 = (end2.x - start2.x) * (start1.y - start2.y) - (end2.y - start2.y) * (start1.x - start2.x);
    let vector2 = (end2.x - start2.x) * (end1.y - start2.y) - (end2.y - start2.y) * (end1.x - start2.x);
    let vector3 = (end1.x - start1.x) * (start2.y - start1.y) - (end1.y - start1.y) * (start2.x - start1.x);
    let vector4 = (end1.x - start1.x) * (end2.y - start1.y) - (end1.y - start1.y) * (end2.x - start1.x);
    return ((vector1 * vector2 < 0) && (vector3 * vector4 < 0));
  }

  toString() {
    return `(${this.x},${this.y})`;
  }
}

export class WaveMatrix {
  w: number;
  h: number;
  data: Int32Array;
  prev: Int32Array;
  rotation: Int8Array;

  constructor(w: number, h: number, data = undefined, prev = undefined, rotation = undefined) {
    this.w = w;
    this.h = h;
    this.data = data || new Int32Array(w * h);
    this.prev = prev || new Int32Array(w * h);
    this.rotation = rotation || new Int16Array(w * h);
  }

  set(x: number, y: number, val: number, prev: number = -1, rotation = -1) {
    let idx = x + this.w * y;
    this.data[idx] = val;
    this.prev[idx] = prev;
    this.setPrevIndex(idx, prev, rotation);
  }
  setPrev(x: number, y: number, prev: number = -1, rotation = -1) {
    this.setPrevIndex(x + this.w * y, prev, rotation);
  }
  setPrevIndex(index: number, prev: number, rotation) {
    this.prev[index] = prev;
    if(rotation === -1) {
      this.rotation[index] = this.rotation[prev];
    } else {
      this.rotation[index] = rotation;
    }
  }

  get(x: number, y: number): number {
    let idx = x + this.w * y;
    return this.data[idx];
  }

  isValid(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  toIndex(x: number, y: number): number {
    return x + this.w * y;
  }
  toCoord(index: number): Coord {
    let x = index % this.w;
    let y = Math.floor((index - x) / this.w);
    return new Coord(x, y);
  }
  nextX(index: number): number {
    return index + 1;
  }
  prevX(index: number): number {
    return index - 1;
  }
  nextY(index: number): number {
    return index + this.w;
  }
  prevY(index: number): number {
    return index - this.w;
  }
}


export class Matrix {
  w: number;
  h: number;
  pixels: Uint16Array; // don't change it to 8!
  freeN: number;

  constructor(w: number, h: number, pixels = undefined) {
    this.w = w;
    this.h = h;
    this.pixels = pixels ? pixels : new Uint16Array(w * h);
    this.freeN = -1;
  }

  getCopy() {
    let copy = new Matrix(this.w, this.h, new Uint16Array(this.pixels));
    copy.freeN = this.freeN;
    return copy;
  }

  get(x: number, y: number) {
    return this.pixels[this.toIndex(x, y)];
  }

  set(x: number, y: number, v: number /*FREE | OBSTACLE | WRAPPED*/) {
    let idx = this.toIndex(x, y);
    if (this.freeN > 0 && v === WRAPPED && this.pixels[idx] === FREE) {
        this.freeN--;
    }
    this.pixels[idx] = v;
  }

  wrap(x: number, y: number) {
    if (this.isValid(x, y) && this.pixels[this.toIndex(x, y)] !== OBSTACLE) {
      if (this.freeN > 0 && this.pixels[this.toIndex(x, y)] !== WRAPPED) {
        this.freeN--;
      }

      this.pixels[this.toIndex(x, y)] = WRAPPED;

    }
  }

  isWrapped(x: number, y: number) {
    return this.pixels[this.toIndex(x, y)] === WRAPPED;
  }

  isWrappedIndex(index: number) {
    return this.pixels[index] === WRAPPED;
  }

  isPassable(x: number, y: number) {
    return this.pixels[this.toIndex(x, y)] !== OBSTACLE;
  }

  isFree(x: number, y: number) {
    return this.pixels[this.toIndex(x, y)] === FREE;
  }

  isFreeIndex(index: number) {
    return this.pixels[index] === FREE;
  }

  isObstacle(x: number, y: number): boolean {
    return this.pixels[this.toIndex(x, y)] === OBSTACLE;
  }

  isObstacleIndex(index: number): boolean {
    return this.pixels[index] === OBSTACLE;
  }

  getNeighbors(from: Coord, len: number = 1): Array<Coord> {
    let neighbors = [];

    for (let i = -len; i <= len; i++) {
      for (let j = -len; j <= len; j++) {
        if ((i === 0 || j === 0) && Math.abs(i) !== Math.abs(j))
          neighbors.push(new Coord(from.x + i, from.y + j));
      }
    }
    return neighbors;
  }

  getFreeNeighborsNum(x: number, y: number, len: number = 1): Array<Coord> {
    let n = 0;

    for (let i = -len; i <= len; i++) {
      for (let j = -len; j <= len; j++) {
        if (this.isValid(x + i, y + j) &&
          this.isFree(x + i, y + j))
          n++;
      }
    }
    return n;
  }

  coord2index(c: Coord): number {
    if (!c instanceof Coord)
      throw `invalid argument ${c}`;
    return c.x + this.w * c.y;
  }

  index2Coord(index: number): Coord {
    return new Coord(index % this.w, Math.floor(index / this.w));
  }

  toIndex(x: number, y: number): number {
    return x + this.w * y;
  }

  isValidCoord(c: Coord): boolean {
    return c.x >= 0 && c.y >= 0 && c.x < this.w && c.y < this.h;
  }

  isValid(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  getFreeNum() : Number {
    if (this.freeN >= 0) return this.freeN;
    let freeNum = 0;
    for (let j = this.h - 1; j >= 0; j--)
      for (let i = 0; i < this.w; i++)
        if(this.isFree(i, j))
          freeNum++;

    this.freeN = freeNum;
    return freeNum;
  }

  isCrossObstacle(from, to: Coord) {
    for (let i = Math.min(from.y, to.y); i <= Math.max(from.y, to.y); i++) {
      for (let j = Math.min(from.x, to.x); j <= Math.max(from.x, to.x); j++) {
        if ((from.x === j && from.y === i) || (to.x === j && to.y === i)) {
          continue;
        }

        if(this.isObstacle(j, i) && from.isObstacleCrossed(to, new Coord(j,i))) {
          return true;
        }
      }
    }

    return false;
  }

  dump() {
    let str = "";

    for (let j = this.h - 1; j >= 0; j--) {
      str += "| ";
      for (let i = 0; i < this.w; i++) {
        let c = this.get(i, j);
        if (c === FREE)
          str += ". ";
        else if (c === OBSTACLE)
          str += "# ";
        else if (c === WRAPPED)
          str += "* ";
      }
      str += "|\n";
    }
    return str;
  }

  isOnBorder(x: number, y: number) {
    const coords = [
      [x + 1, y], // Right middle
      [x + 1, y + 1], // Right upper
      [x, y + 1], // Upper middle
      [x - 1, y + 1], // Left upper
      [x - 1, y], // Middle left
      [x - 1, y - 1], // Left bottom
      [x, y - 1], // Middle bottom
      [x + 1, y - 1], // Right bottom
    ];

    return coords.find(([currX, currY]) => (
      !this.isValid(currX, currY)) || this.isObstacle(currX, currY)
    );
  }
}

export const parseMatrix = (layer: string) : Matrix => {

  const lines = layer.split("\n").filter((line) => line.replace(/^ *\|? /, "")
    .replace(/ \|?$/, "") !== "");
  const h = lines.length;
  const w = lines[0].replace(/^ *\|? /, "")
    .replace(/ \|?$/, "")
    .split(" ").length;
  const matrix = new Matrix(w, h);

  for(let j = 0; j < h; j++) {
    const cols = lines[j].replace(/^ *\|? /, "")
      .replace(/ \|?$/, "")
      .split(" ");

    if(cols.length !== w)
      throw `Invalid dimensions (${w} and ${cols.length}) of matrix template`;

    for (let i = 0; i < w; i++) {
      if (cols[i] !== "." && cols[i] !== "*" && cols[i] !== "#")
        throw `Invalid character ${cols[i]} in matrix template`;

      matrix.set(i, h - j - 1, cols[i] === "." ? FREE : cols[i] === "*" ? WRAPPED : OBSTACLE);
    }
  }

  return matrix;
};

export class Rover {
  pos: Coord;
  widthLeft: number;
  widthRight: number;
  rotation: number;

  path : Array<Coord>;
  pathStep : number;
  target : Coord;
  drillTicks : number;
  wheelTicks : number;
  isDrilling : boolean;

  constructor(pos: Coord, widthLeft: number, widthRight: number, rotation: number = 3) {
    this.pos = pos;
    this.widthLeft = widthLeft;
    this.widthRight = widthRight;
    this.rotation = rotation;

    this.path = [];
    this.pathStep = 0;
    this.target = 0;
    this.drillTicks = 0;
    this.wheelTicks = 0;
    this.isDrilling = false;
  }

  getCopy(): Rover {
    return new Rover(this.pos.getCopy(), this.widthLeft, this.widthRight, this.rotation);
  }

  rotCW() {
    this.rotation = this.getRotCW(this.rotation);
  }

  rotCCW() {
    this.rotation = this.getRotCCW(this.rotation);
  }

  getRotCW(rotation) {
    if (rotation >= 9)
      return 0;
    return rotation + 3;
  }

  getRotCCW(rotation) {
    if (rotation <= 0)
      return 9;
    return rotation - 3;
  }


  getManipulators(): Array<Coord> {
    let mans = [];

    for (let i = this.widthLeft - 1; i >= 0; i--)
      mans.push(new Coord(1, i + 1));

    mans.push(new Coord(1, 0));

    for (let i = 0; i < this.widthRight; i++)
      mans.push(new Coord(1, -(i + 1)));

    if (this.rotation === 0)
      mans = mans.map(m => m.rotCCW());
    else for (let i = 3; i < this.rotation; i += 3)
      mans = mans.map(m => m.rotCW());

    return mans;
  }

  extendManipulators() : Coord {
    if (this.widthLeft <= this.widthRight) {
      this.widthLeft++;
      return this.getManipulators()[0];
    }
    else {
      this.widthRight++;
      let mans = this.getManipulators();
      return mans[mans.length - 1];
    }
  }
}

export class Booster {
  pos : Coord;
  type : string;

  lockedBy : number;

  constructor(x: number, y: number, type: string) {
    this.pos = new Coord(x, y);
    this.type = type;

    this.lockedBy = -1;
  }
}

export class InventoryBooster {
  type : string;
  stepAcquired : number;
  acquiredByWorkerId : number;

  lockedById : number;

  constructor(type : string, stepAcquired : number, acquiredByWorkerId : number) {
    this.type = type;
    this.stepAcquired = stepAcquired;
    this.acquiredByWorkerId = acquiredByWorkerId;
    this.lockedById = -1;
  }
}

export class State {

  // map
  m : Matrix;
  boosters : Array<Booster>;

  // state
  step : number;
  workers : Array<Rover>;
  inventoryBoosters : Array<InventoryBooster>;

  spawnsPresent : boolean;

  constructor(w: number, h: number, m: Matrix = undefined) {
    this.m = m ? m : new Matrix(w, h);
    this.boosters = [];

    this.step = 0;
    this.workers = [];
    this.workers[0] = new Rover(new Coord(-1, -1), 1, 1);
    this.inventoryBoosters = [];

    this.spawnsPresent = false;
  }

  getCopy() {
    let copy = new State(this.m.w, this.m.h, this.m.getCopy());
    copy.boosters = this.boosters.slice(0); // shallow copy
    copy.step = this.step;
    copy.workers = this.workers.slice(0);
    copy.inventoryBoosters = this.inventoryBoosters.slice(0);
    copy.spawnsPresent = this.spawnsPresent;
    return copy;
  }

  getAvailableInventoryBoosters(type : string, workerId : number) : number {
    let num = 0;
    //console.log(this.step);

    for(let i = 0; i < this.inventoryBoosters.length; i++) {
      let ib = this.inventoryBoosters[i];

      //console.log(ib);

      if(ib.type === type && ((ib.acquiredByWorkerId <= workerId && this.step > ib.stepAcquired)
            || (ib.acquiredByWorkerId > workerId && this.step > ib.stepAcquired + 1))) {

        //console.log("found!");

        if(ib.lockedById === -1 || ib.lockedById === workerId)
          num++;
        }
      }

    return num;
  }

  spendInventoryBooster(type : string, workerId : number) {
    for(let i = 0; i < this.inventoryBoosters.length; i++) {
      let ib = this.inventoryBoosters[i];

      if(ib.type === type && ((ib.acquiredByWorkerId <= workerId && this.step > ib.stepAcquired)
          || (ib.acquiredByWorkerId > workerId && this.step > ib.stepAcquired + 1))) {
        this.inventoryBoosters.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  lockInventoryBooster(type : string, workerId : number) {
    for(let i = 0; i < this.inventoryBoosters.length; i++) {
      let ib = this.inventoryBoosters[i];

      if(ib.type === type && ((ib.acquiredByWorkerId <= workerId && this.step > ib.stepAcquired)
          || (ib.acquiredByWorkerId > workerId && this.step > ib.stepAcquired + 1))) {
        ib.lockedById = workerId;
        return true;
      }
    }
    return false;
  }

  moveWorker(id : number, newPos : Coord) {

    let worker = this.workers[id];
    worker.pos = newPos.getCopy();

    let wx = worker.pos.x;
    let wy = worker.pos.y;
    this.m.wrap(wx, wy);
    worker.getManipulators().forEach(m => {
      if (!this.m.isCrossObstacle(worker.pos, new Coord(wx + m.x, wy + m.y)))
        this.m.wrap(wx + m.x, wy + m.y)
    });

    // acquire boosters
    for(let i = this.boosters.length - 1; i >= 0; i--) {
      if(this.boosters[i].pos.isEqual(worker.pos)) {
        let acuiredBooster = new InventoryBooster(this.boosters[i].type, this.step, id);
        this.inventoryBoosters.push(acuiredBooster);

        if(this.boosters[i].type !== "X")
          this.boosters.splice(i,1);
      }
    }
  }

  static isBoosterUseful(type : string) : boolean {
    return type === "C" || type === "B" /*|| type === "L" || type === "R" || type === "F"*/;
  }

  checkBooster(x : number, y : number, type : string, filterLocked = false) {
    //console.log("cb " + x + ", "+ y);
    for(let i = 0; i < this.boosters.length; i++) {
      let booster = this.boosters[i];
      if (booster.pos.isEqualXY(x, y)) {
        //if (this.boosters[i].type !== "X") {
        if ((type === '*' && State.isBoosterUseful(booster.type)) || booster.type === type) {
          //console.log("booster!")
            if(!filterLocked || (filterLocked && booster.lockedBy === -1))
                return booster;
        }
      }
    }
      return false;
  }

  getRemainingUnlockedBoostersNum() : number {
    let num = 0;
    for(let i = 0; i < this.boosters.length; i++) {
      if (this.boosters[i].lockedBy === -1 && State.isBoosterUseful(this.boosters[i].type))
        num++;
    }
    return num;
  }

  getRemainingCloningNum() : number {
    let num = 0;
    for(let i = 0; i < this.boosters.length; i++) {
      if (this.boosters[i].type === 'C')
        num++;
    }
    return num;
  }

  dump(/*drawManipulators = false*/) {
    let str = "";

    //let mans = this.worker.getManipulators().map(m => m.getAdded(this.worker.pos));

    for (let j = this.m.h - 1; j >= 0; j--) {
      str += "| ";
      let prevMan = false;
      for (let i = 0; i < this.m.w; i++) {
        //let currMan = mans.find(m => m.isEqual(new Coord(i, j)));

        //if (drawManipulators && (currMan || prevMan))
         // str = str.substring(0, str.length - 1) + 'I';

        let c = this.m.get(i, j);
        let char = ".";

        if (c === FREE)
          char = ".";
        else if (c === OBSTACLE)
          char = "#";
        else if (c === WRAPPED)
          char = "*";

        for(let k = 0; k < this.workers.length; k++)
          if(this.workers[k].pos.x === i && this.workers[k].pos.y === j)
          char = "W";

        for(let k = 0; k < this.boosters.length; k++)
          if(this.boosters[k].pos.x === i && this.boosters[k].pos.y === j)
            char = this.boosters[k].type;

        str += char;
        str += ' ';
        //str += drawManipulators && currMan ? 'I' : ' ';
        //prevMan = currMan;
      }
      str += "|\n";
    }
    return str;
  }
}

export const parseCoords = (coords: string) : Array<Coord> => {
  // (4, 5), (1, -1), (7, 0)

  return coords.split(")") // split by closing brace
    .map(c => c.replace(/ *\,? *\( */, "")) // remove opening brace with comma and spaces
    .filter(c => c !== "")
    .map(c => {
      let xy = c.split(",");
      return new Coord(parseInt(xy[0].trim()), parseInt(xy[1].trim()));
    });
};

export const parseState = (layer: string) : State => {

  const lines = layer.split("\n").filter((line) => line.replace(/^ *\|? /, "")
    .replace(/ \|?$/, "") !== "");
  const h = lines.length;
  const w = lines[0].replace(/^ *\|? /, "")
    .replace(/ \|?$/, "")
    .split(" ").length;

  const s = new State(w, h);

  for(let j = 0; j < h; j++) {
    const cols = lines[j].replace(/^ *\|? /, "")
      .replace(/ \|?$/, "")
      .split(" ");

    if(cols.length !== w)
      throw `Invalid dimensions (${w} and ${cols.length}) of matrix template`;

    for (let i = 0; i < w; i++) {
      if (cols[i] !== "." && cols[i] !== "*" && cols[i] !== "#" && cols[i] !== "W"
        && cols[i] !== "B" && cols[i] !== "F" && cols[i] !== "L" && cols[i] !== "X"
        && cols[i] !== "R")
        throw `Invalid character ${cols[i]} in matrix template`;

      s.m.set(i, h - j - 1, cols[i] === "#" ? OBSTACLE : cols[i] === "*" ? WRAPPED : FREE);

      if(cols[i] === "W")
        s.moveWorker(0, new Coord(i, h - j - 1));

      if(cols[i] === "B" || cols[i] === "F" || cols[i] === "L" || cols[i] === "X" || cols[i] === "R") {
        if(cols[i] === "X")
          s.spawnsPresent = true;
        s.boosters.push(new Booster(i, h - j - 1, cols[i]));
      }
    }
  }

  return s;
};
