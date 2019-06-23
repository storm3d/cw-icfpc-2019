// @flow
import Path from '../model/path';
import { Coord, FREE, OBSTACLE, Matrix, Rover } from '../model/model';

const HORIZONTAL_ORIENTATION = 'h';
const VERTICAL_ORIENTATION = 'v';

export default class MapSerializer {
  matrix: Matrix;
  worker: Rover;

  constructor(matrix: Matrix, worker: Rover) {
    this.matrix = matrix;
    this.worker = worker;
  }

  dump(): string {
    const verticalPaths = this.getVerticalPaths();
    const horizontalPaths = this.getHorizontalPaths();
    const paths = this.sortHorizontalPaths(verticalPaths, horizontalPaths);
    const contours = paths.map(path => `(${path.start.x},${path.start.y}),(${path.end.x},${path.end.y})`)
      .join(',');
    const workerCoord = this.worker.pos;
    const boostersStr = ''; // @TODO

    return `${contours}#(${workerCoord.x},${workerCoord.y})##${boostersStr}`;
  }

  /** @private */
  getVerticalPaths(): Array<Path> {
    const paths: Array<Path> = [];

    for (let x = 0; x <= this.matrix.w; x++) {
      let isNewPath = true;

      for (let y = 0; y <= this.matrix.h; y++) {
        const leftCellState = !this.matrix.isValid(x - 1, y) || this.matrix.isObstacle(x - 1, y) ?
          OBSTACLE : FREE;
        const currCellState = !this.matrix.isValid(x, y) || this.matrix.isObstacle(x, y) ? OBSTACLE : FREE;

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

    for (let y = 0; y <= this.matrix.h; y++) {
      let isNewPath = true;

      for (let x = 0; x <= this.matrix.w; x++) {
        const bottomCellState = !this.matrix.isValid(x, y - 1) || this.matrix.isObstacle(x, y - 1) ?
          OBSTACLE : FREE;
        const currCellState = !this.matrix.isValid(x, y) || this.matrix.isObstacle(x, y) ? OBSTACLE : FREE;

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
    const joinedPaths: Array<Path> = [];

    currPath = paths[currPathIndex];

    if (currPath.orientation === HORIZONTAL_ORIENTATION) {
      joinedPaths.push(currPath);
    }

    paths.splice(currPathIndex, 1);

    for (let i = 0; i < 1000000000; i++) {
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
    let minY = Infinity;

    for (let i = 0; i < paths.length; i++) {
      // First path should be horizontal
      if (paths[i].orientation === VERTICAL_ORIENTATION) {
        continue;
      }

      if (paths[i].start.y < minY) {
        neededIndex = i;
        minY = paths[i].start.y;
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
