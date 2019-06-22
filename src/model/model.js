// @flow

export const FREE = 0;
export const OBSTACLE = 1;
export const WRAPPED = 2;

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
    return this.getPointOfIntersection(this.getCenter(),
        to.getCenter(),
        testedCoord,
        new Coord(testedCoord.x + 1, testedCoord.y))
        ||
        this.getPointOfIntersection(this.getCenter(),
            to.getCenter(),
            testedCoord,
            new Coord(testedCoord.x, testedCoord.y + 1))
        ||
        this.getPointOfIntersection(this.getCenter(),
            to.getCenter(),
            new Coord(testedCoord.x + 1, testedCoord.y),
            new Coord(testedCoord.x + 1, testedCoord.y + 1))
        ||
        this.getPointOfIntersection(this.getCenter(),
            to.getCenter(),
            new Coord(testedCoord.x, testedCoord.y + 1),
            new Coord(testedCoord.x + 1, testedCoord.y + 1));
  }

  getPointOfIntersection(start1:Coord, end1:Coord, start2:Coord, end2:Coord) {
    let vector1 = (end2.x - start2.x) * (start1.y - start2.y) - (end2.y - start2.y) * (start1.x - start2.x);
    let vector2 = (end2.x - start2.x) * (end1.y - start2.y) - (end2.y - start2.y) * (end1.x - start2.x);
    let vector3 = (end1.x - start1.x) * (start2.y - start1.y) - (end1.y - start1.y) * (start2.x - start1.x);
    let vector4 = (end1.x - start1.x) * (end2.y - start1.y) - (end1.y - start1.y) * (end2.x - start1.x);
    return ((vector1 * vector2 <= 0) && (vector3 * vector4 <= 0));
  }

  toString() {
    return `(${this.x},${this.y})`;
  }
}


export class Matrix {
  w: number;
  h: number;
  pixels: Uint8Array;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.pixels = new Uint16Array(w * h);
  }

  get(x: number, y: number) {
    return this.pixels[this.toIndex(x, y)];
  }

  set(x: number, y: number, v: number /*FREE | OBSTACLE | WRAPPED*/) {
    this.pixels[this.toIndex(x, y)] = v;
  }

  wrap(x: number, y: number) {
    if (this.isValid(x, y) && this.pixels[this.toIndex(x, y)] !== OBSTACLE)
      this.pixels[this.toIndex(x, y)] = WRAPPED;
  }

  isWrapped(x: number, y: number) {
    return this.pixels[this.toIndex(x, y)] === WRAPPED;
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
    let freeNum = 0;
    for (let j = this.h - 1; j >= 0; j--)
      for (let i = 0; i < this.w; i++)
        if(this.isFree(i, j))
          freeNum++;

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

  constructor(pos: Coord, widthLeft: number, widthRight: number, rotation: number = 3) {
    this.pos = pos;
    this.widthLeft = widthLeft;
    this.widthRight = widthRight;
    this.rotation = rotation;
  }

  rotCW() {
    this.rotation += 3;
    if (this.rotation > 9)
      this.rotation = 0;
  }

  rotCCW() {
    this.rotation -= 3;
    if (this.rotation < 0)
      this.rotation = 9;
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
  type : String;

  constructor(x: number, y: number, type: String) {
    this.pos = new Coord(x, y);
    this.type = type;
  }
}

export class State {
  m : Matrix;
  boosters : Array<Booster>;
  worker : Rover;
  extensions : Number;
  fasts : Number;
  drills : Number;
  teleports : Number;

  constructor(w: number, h: number) {
    this.m = new Matrix(w, h);
    this.boosters = [];
    this.startingBoosters = [];
    this.worker = new Rover(new Coord(-1, -1), 1, 1);
    this.extensions = 0;
    this.fasts = 0;
    this.drills = 0;
    this.teleports = 0;
  }

  moveWorker(newPos : Coord) {
    this.worker.pos = newPos.getCopy();

    let wx = this.worker.pos.x;
    let wy = this.worker.pos.y;
    this.m.wrap(wx, wy);
    this.worker.getManipulators().forEach(m => {
      if (!this.m.isCrossObstacle(this.worker.pos, new Coord(wx + m.x, wy + m.y)))
        this.m.wrap(wx + m.x, wy + m.y)
    });

    for(let i = this.boosters.length - 1; i >= 0; i--) {
      if(this.boosters[i].pos.isEqual(this.worker.pos)) {
        if(this.boosters[i].type === "B")
          this.extensions++;
        else if(this.boosters[i].type === "F")
          this.fasts++;
        else if(this.boosters[i].type === "L")
          this.drills++;
        else if(this.boosters[i].type === "R")
          this.teleports++;
        if(this.boosters[i].type !== "X")
          this.boosters.splice(i,1);
      }
    }
  }

  checkBooster(x : number, y : number) : boolean {
    //console.log("cb " + x + ", "+ y);
    for(let i = 0; i < this.boosters.length; i++) {
      if (this.boosters[i].pos.x === x && this.boosters[i].pos.y === y) {
        //if (this.boosters[i].type !== "X") {
        if (this.boosters[i].type === "B") {
          //console.log("booster!")
          return true;
        }
      }
    }

      return false;
  }

  dump(drawManipulators = false) {
    let str = "";

    let mans = this.worker.getManipulators().map(m => m.getAdded(this.worker.pos));

    for (let j = this.m.h - 1; j >= 0; j--) {
      str += "| ";
      let prevMan = false;
      for (let i = 0; i < this.m.w; i++) {
        let currMan = mans.find(m => m.isEqual(new Coord(i, j)));

        if (drawManipulators && (currMan || prevMan))
          str = str.substring(0, str.length - 1) + 'I';

        let c = this.m.get(i, j);
        let char = ".";

        if (c === FREE)
          char = ".";
        else if (c === OBSTACLE)
          char = "#";
        else if (c === WRAPPED)
          char = "*";

        if(this.worker.pos.x === i && this.worker.pos.y === j)
          char = "W";

        for(let k = 0; k < this.boosters.length; k++)
          if(this.boosters[k].pos.x === i && this.boosters[k].pos.y === j)
            char = this.boosters[k].type;

        str += char;
        str += drawManipulators && currMan ? 'I' : ' ';
        prevMan = currMan;
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
        s.moveWorker(new Coord(i, h - j - 1));

      if(cols[i] === "B" || cols[i] === "F" || cols[i] === "L" || cols[i] === "X" || cols[i] === "R") {
        s.boosters.push(new Booster(i, h - j - 1, cols[i]));
      }
    }
  }

  return s;
};