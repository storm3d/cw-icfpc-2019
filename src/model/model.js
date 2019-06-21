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
    return this.pixels[this.coord2index(x, y)];
  }

  set(x: number, y: number, v: number) {
    this.pixels[this.coord2index(x, y)] = v;
  }

  wrap(x: number, y: number) {
    this.pixels[this.coord2index(x, y)] = 1;
  }

  isWrapped(x: number, y: number) {
    return this.pixels[this.coord2index(x, y)] > 0;
  }

  isObstacle(x: number, y: number) {
    return this.pixels[this.coord2index(x, y)] > 0;
  }

  coord2index(x: number, y: number) {
    return x + this.w * y;
  }

  isValidCoord(c: Coord) {
    return c.x >= 0 && c.y >= 0 && c.z >= 0 && c.x < this.r && c.y < this.r && c.z < this.r
  }

  dump() {
    let str = "";

    for (let j = this.h - 1; j >= 0; j--) {
      str += "|";
      for (let i = 0; i < this.w; i++) {
        let c = this.get(i, j);
        if (c === FREE)
          str += " ";
        else if (c === OBSTACLE)
          str += "#";
        else if (c === WRAPPED)
          str += ".";
      }
      str += "|\n";
    }
    return str;
  }
}

export class Booster {
  pos : Coord;
  type : String;
}

export class State {
  field : Matrix;
  boosters : Array<Booster>;
  workerPos : Coord;
}