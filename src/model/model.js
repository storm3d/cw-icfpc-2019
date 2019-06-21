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

  getAdded(v: Coord) {
    return new Coord(this.x + v.x, this.y + v.y)
  }

  getDiff(v: Coord) {
    return new Coord(v.x - this.x, v.y - this.y)
  }

  isEqual(c : Coord) {
    return this.x === c.x && this.y === c.y
  }

  getCopy() {
    return new Coord(this.x, this.y)
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
    this.pixels = new Uint8Array(w * h);
  }

  get(x: number, y: number) {
    return this.pixels[this.toIndex(x, y)];
  }

  set(x: number, y: number, v: FREE | OBSTACLE | WRAPPED) {
    this.pixels[this.toIndex(x, y)] = v;
  }

  wrap(x: number, y: number) {
    if (this.pixels[this.toIndex(x, y) === OBSTACLE])
      throw `Trying to wrap pixel (${x}, ${y}) however it's an obstacle`;
    this.pixels[this.toIndex(x, y)] = WRAPPED;
  }

  isWrapped(x: number, y: number) {
    return this.pixels[this.toIndex(x, y)] === WRAPPED;
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

  toIndex(x: number, y: number): number {
    return x + this.w * y;
  }

  isValidCoord(c: Coord): boolean {
    return c.x >= 0 && c.y >= 0 && c.x < this.w && c.y < this.h;
  }

  isValid(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
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

      matrix.set(i, h - j - 1, cols[i] === "." ? FREE : cols[i] === "*" ? WRAPPED : OBSTACLE)
    }
  }

  return matrix;
};


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
  workerPos : Coord;

  constructor(w: number, h: number) {
    this.m = new Matrix(w, h);
    this.boosters = new Array();
    this. workerPos = new Coord(-1, -1);
  }

  dump() {
    let str = "";

    for (let j = this.m.h - 1; j >= 0; j--) {
      str += "| ";
      for (let i = 0; i < this.m.w; i++) {
        let c = this.m.get(i, j);
        let char = ". ";

        if (c === FREE)
          char = ". ";
        else if (c === OBSTACLE)
          char = "# ";
        else if (c === WRAPPED)
          char = "* ";

        if(this.workerPos.x === i && this.workerPos.y === j)
          char = "W ";

        for(let k = 0; k < this.boosters.length; k++)
          if(this.boosters[k].pos.x === i && this.boosters[k].pos.y === j)
            char = this.boosters[k].type + " ";

        str += char;
      }
      str += "|\n";
    }
    return str;
  }
}

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
        && cols[i] !== "B" && cols[i] !== "F" && cols[i] !== "L" && cols[i] !== "X")
        throw `Invalid character ${cols[i]} in matrix template`;

      s.m.set(i, h - j - 1, cols[i] === "#" ? OBSTACLE : cols[i] === "*" ? WRAPPED : FREE);

      if(cols[i] === "W") {
        s.workerPos.x = i;
        s.workerPos.y = h - j - 1;
      }

      if(cols[i] === "B" || cols[i] === "F" || cols[i] === "L" || cols[i] === "X") {
        s.boosters.push(new Booster(i, h - j - 1, cols[i]));
      }
    }
  }

  return s;
};