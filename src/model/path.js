// @flow

import { Coord } from './model';

export default class Path {
  start: Coord;
  end: Coord;
  orientation: string;

  constructor(start: Coord, end: Coord, orientation: string) {
    this.start = start;
    this.end = end;
    this.orientation = orientation;
  }

  flipStartEnd(): Path {
    const tempX = this.start.x;
    const tempY = this.start.y;

    this.start.x = this.end.x;
    this.start.y = this.end.y;
    this.end.x = tempX;
    this.end.y = tempY;

    return this;
  }
}