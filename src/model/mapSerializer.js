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

export default class MapSerializer {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  dump(): string {
    const verticalPaths = this.getVerticalPaths();
    const horizontalPaths = this.getHorizontalPaths();
    const paths = this.sortHorizontalPaths(verticalPaths, horizontalPaths);
    const dump = paths.map(path => `(${path.start.x},${path.start.y}),(${path.end.x},${path.end.y})`)
      .join(',');

    return dump;
  }

  /** @private */
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

  /** @private */
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
  sortHorizontalPaths(verticalPaths: Array<Path>, horizontalPaths: Array<Path>): Array<Path> {
    let currPath;

    const paths: Array<Path> = verticalPaths.concat(horizontalPaths);
    const currPathIndex = this.findStartPathIndex(paths);

    currPath = paths[currPathIndex];
    paths.splice(currPathIndex, 1);

    const joinedPaths: Array<Path> = [currPath];

    for (let i = 0; i < 10000; i++) {
      const nextPathIndex = this.findNextPathIndex(currPath, paths);

      if (nextPathIndex === null) {
        break;
      }

      currPath = paths[nextPathIndex];

      if (currPath.orientation === HORIZONTAL_ORIENTATION) {
        joinedPaths.push(currPath);
      }

      paths.splice(nextPathIndex, 1);
    }

    return joinedPaths;
  }

  /** @private */
  findStartPathIndex(paths: Array<Path>): number {
    let neededIndex = 0;
    let minY = paths[0].start.y;

    for (let i = 0; i < paths.length; i++) {
      // First path should be horizontal
      if (paths[i].orientation === VERTICAL_ORIENTATION) {
        continue;
      }

      if (paths[i].start.y < minY || paths[i].end.y < minY) {
        neededIndex = i;
        minY = Math.min(paths[i].start.y, paths[i].end.y);
      }
    }

    const startPath = paths[neededIndex];

    // Flip counter clockwise direction
    if (startPath.start.x > startPath.end.x) {
      startPath.flipStartEnd();
    }

    return neededIndex;
  }

  findNextPathIndex(currPath: Path, paths: Array<Path>): number|null {
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];

      if (path.start.x === currPath.end.x && path.start.y === currPath.end.y) {
        return i;
      }

      if (path.end.x === currPath.end.x && path.end.y === currPath.end.y) {
        path.flipStartEnd();

        return i;
      }
    }

    return null;
  }
}
