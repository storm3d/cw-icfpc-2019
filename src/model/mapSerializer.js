// @flow
import { State, Coord } from '../model/model';

const HORIZONTAL_ORIENTATION = 'h';
const VERTICAL_ORIENTATION = 'v';

export default class MapSerializer {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  dump(): string {
    let currCoord = this.findFirstFreeCell();
    let counter = 0;
    // let paths: Array<any> = [];

    const iterationsLimit = 1000000000;
    const allCoords: Array<Coord> = [currCoord];

    while (true) {
      if (counter >= iterationsLimit) {
        throw new Error('Too many iterations in MapSerializer. Something wend wrong.');
      }

      const nextCoord = this.getNextCoord(currCoord, allCoords);

      if (nextCoord === null) {
        break;
      }

      allCoords.push(nextCoord);
      currCoord = nextCoord;
      counter++;
    }

    // paths.push({
    //   start: allCoords[0],
    //   end: null,
    //   orientation: null
    // });

    // for (let i = 1; i < allCoords.length; i++) {
    //   let orientation;
    //
    //   const currPathCoord = allCoords[i];
    //   const prevPathCoord = allCoords[i - 1];
    //   const endCoord = new Coord(currPathCoord.x, currPathCoord.y);
    //   const lastPath = paths[paths.length - 1];
    //
    //   if (currPathCoord.y === prevPathCoord.y) {
    //     orientation = HORIZONTAL_ORIENTATION;
    //     endCoord.x = currPathCoord.x;
    //   } else if (currPathCoord.x === prevPathCoord.x) {
    //     orientation = VERTICAL_ORIENTATION;
    //     endCoord.y = currPathCoord.y;
    //   }
    //
    //   if (lastPath.orientation === null) {
    //     lastPath.orientation = orientation;
    //   }
    //
    //   if (lastPath.orientation === orientation) {
    //     lastPath.end = endCoord;
    //   } else {
    //     paths.push({
    //       start: prevPathCoord,
    //       end: currPathCoord,
    //       orientation
    //     });
    //   }
    //
    //   // if (paths[paths.length - 1].orientation === null) {
    //   //   paths[paths.length - 1].orientation = orientation;
    //   // }
    //   //
    //   // paths[paths.length - 1].end = endCoord;
    //   //
    //   // if (paths[paths.length - 1].orientation !== orientation) {
    //   //   paths.push({
    //   //     start: new Coord(currPathCoord.x, currPathCoord.y),
    //   //     end: null,
    //   //     orientation,
    //   //   });
    //   // }
    // }

    // paths = paths.filter(({ orientation }) => orientation === HORIZONTAL_ORIENTATION);

    console.log(allCoords);
    // console.log(paths);

    return '';
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
