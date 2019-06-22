// @flow
import { State, Coord, FREE, OBSTACLE } from '../model/model';

const HORIZONTAL_ORIENTATION = 'h';
const VERTICAL_ORIENTATION = 'v';

class Path {
  start: Coord;
  end: Coord;
  orientation: string;

  constructor(start: Coord, end: Coord, orientation: string = VERTICAL_ORIENTATION) {
    this.start = start;
    this.end = end;
    this.orientation = orientation;
  }
}

export default class MapSerializer {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  dump(): string {
    const verticalPaths = this.getVerticalPaths();
    const horizontalPaths = this.getHorizontalPaths();

    console.log('verticalPaths', verticalPaths);
    console.log('horizontalPaths', horizontalPaths);
    // console.log(paths);

    return '';
  }

  getVerticalPaths(): Array<Path> {
    const paths: Array<Path> = [];

    for (let x = 0; x <= this.state.m.w; x++) {
      let isNewPath = true;

      for (let y = 0; y <= this.state.m.h; y++) {
        const leftCellState = !this.state.m.isValid(x - 1, y) || this.state.m.isObstacle(x - 1, y) ?
          OBSTACLE : FREE;
        const currCellState = !this.state.m.isValid(x, y) || this.state.m.isObstacle(x, y) ? OBSTACLE : FREE;

        // If neighbours are different
        if (currCellState !== leftCellState)  {
          if (isNewPath) {
            paths.push(new Path(
              new Coord(x, y),
              new Coord(x, y + 1),
              VERTICAL_ORIENTATION
            ));
            isNewPath = false;
          } else {
            paths[paths.length - 1].end = new Coord(x, y + 1);
          }
        } else {
          // If neighbours are the same - end path
          isNewPath = true;
        }
      }
    }

    return paths;
  }

  getHorizontalPaths(): Array<Path> {
    const paths: Array<Path> = [];

    for (let y = 0; y <= this.state.m.h; y++) {
      let isNewPath = true;

      for (let x = 0; x <= this.state.m.w; x++) {
        const bottomCellState = !this.state.m.isValid(x, y - 1) || this.state.m.isObstacle(x, y - 1) ?
          OBSTACLE : FREE;
        const currCellState = !this.state.m.isValid(x, y) || this.state.m.isObstacle(x, y) ? OBSTACLE : FREE;

        // If neighbours are different
        if (currCellState !== bottomCellState)  {
          if (isNewPath) {
            paths.push(new Path(
              new Coord(x, y),
              new Coord(x + 1, y),
              HORIZONTAL_ORIENTATION
            ));
            isNewPath = false;
          } else {
            paths[paths.length - 1].end = new Coord(x + 1, y);
          }
        } else {
          // If neighbours are the same - end path
          isNewPath = true;
        }
      }
    }

    return paths;
  }

  /** @private */
  findFirstFreeCell(): Coord {
    for (let y = 0; y < this.state.m.w; y++) {
      for (let x = 0; x < this.state.m.h; x++) {
        const isFree = this.state.m.isFree(x, y);

        if (isFree) {
          return new Coord(x, y);
        }
      }
    }

    throw new Error('No free cells were found');
  }

  /** @private */
  getNextCoord(currCoord: Coord, allCoords: Array<Coord>): Coord|null {
    const coords = [
      [currCoord.x + 1, currCoord.y], // Right
      [currCoord.x, currCoord.y + 1], // Upper
      [currCoord.x - 1, currCoord.y], // Left
      [currCoord.x, currCoord.y - 1], // Bottom
    ];
    const neededCoords = coords.find(([x, y]) => (
      this.state.m.isValid(x, y) &&
      this.state.m.isFree(x, y) &&
      this.state.m.isOnBorder(x, y) &&
      ! allCoords.find((coord: Coord) => coord.x === x && coord.y === y)
    ));

    if (!neededCoords) {
      return null;
    }

    return new Coord(neededCoords[0], neededCoords[1]);
  }
}
