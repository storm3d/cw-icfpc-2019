import {  } from "../../src/model/model";
import assert from 'assert';
import { Matrix, WaveMatrix, parseMatrix, State, Booster, parseState, parseCoords } from "../../src/model/model";
import { WRAPPED, OBSTACLE } from "../../src/model/model";
import {Coord} from "../../src/model/model";

describe("Basic model", () => {
  test("Matrix dump", () => {
    const empty =
      `| . . |\n| . . |\n`;
    let m = new Matrix(2, 2);
    expect(m.dump()).toEqual(empty);

    m.set(0, 0, WRAPPED);
    m.set(1, 0, OBSTACLE);
    const one =
      `| . . |\n| * # |\n`;
    expect(m.dump()).toEqual(one);
  });

  test("Matrix parse+dump", () => {
    const layout = `| . # # |
| . # # |
| . . . |
| * . . |
`;
    let m = parseMatrix(layout);
    expect(m.dump()).toEqual(layout);
  });

  test("Matrix copy", () => {
    const layout = `| . # # |
| . # # |
| . . . |
| * . . |
`;
    let m = parseMatrix(layout);
    let copy = m.getCopy();
    expect(copy.dump()).toEqual(layout);
  });

  test("State dump", () => {

    let s = new State(2, 2);

    s.m.set(0, 0, WRAPPED);
    s.m.set(1, 0, OBSTACLE);

    s.workers[0].pos.x = 0;
    s.workers[0].pos.y = 1;

    s.boosters.push(new Booster(1, 1, 'F'))

    const one =
      `| W F |\n| * # |\n`;
    expect(s.dump()).toEqual(one);
  });

  test("State parse and dump", () => {

    const layout = `| B # # . |
| W # # . |
| . F . L |
| * . X . |
`;
    let s = parseState(layout);
    expect(s.dump()).toEqual(layout);
  });

  test("Cross Obstacle", () => {
    const layout = `| . . . . . |
| . . . . . |
| . . # . . |
| . . . . . |
| * . . . . |
`;

    let s = parseState(layout);
    expect(s.m.isCrossObstacle(new Coord(3, 1), new Coord(1, 2))).toEqual(true);
    expect(s.m.isCrossObstacle(new Coord(2, 1), new Coord(1, 2))).toEqual(false);
    expect(s.m.isCrossObstacle(new Coord(1, 2), new Coord(2, 1))).toEqual(false);
    expect(s.m.isCrossObstacle(new Coord(3, 1), new Coord(2, 0))).toEqual(false);
  });

  test("State parse empty", () => {

    const layout = `
        | . . . . |
        | . . . . |
        `;
    let s = parseState(layout);
    expect(s.m.w).toEqual(4);
    expect(s.m.h).toEqual(2);
  });

  test("State copy", () => {

    const layout = `| B # # . |
| W # # . |
| . F . L |
| * . X . |
`;
    let s = parseState(layout);
    let copy = s.getCopy();
    expect(copy.dump()).toEqual(layout);
  });

  test("State occupancy test", () => {

    const layout = `
        | * * * . |
        | . # . . |
        `;
    let s = parseState(layout);
    expect(s.m.isWrapped(0, 1)).toEqual(true);
    expect(s.m.isWrapped(3, 1)).toEqual(false);
    expect(s.m.isWrapped(1, 0)).toEqual(false);

    expect(s.m.isPassable(1, 0)).toEqual(false);
    expect(s.m.isPassable(0, 0)).toEqual(true);
    expect(s.m.isPassable(0, 1)).toEqual(true);

    expect(s.m.isObstacle(0, 0)).toEqual(false);
    expect(s.m.isObstacle(0, 1)).toEqual(false);
    expect(s.m.isObstacle(1, 0)).toEqual(true);
  });

  test("get neighbors", () => {
    let layout = `
      | . . * . |
      | . . * * |
      | . . . . |
      | * . # . |
    `;

    let m = parseMatrix(layout);

    expect(m.getNeighbors(new Coord(0, 0))).toEqual(parseCoords("(-1,0),(0,-1),(0,1),(1,0)"));
  })

  test("Test WaveMatrix", () => {
    let w = 9;
    let h = 7;
    let waveMatrix = new WaveMatrix(w, h);

    let coords = [new Coord(), new Coord(1,2), new Coord(1,1), new Coord(w-1, h-1), new Coord(w-1, 0), new Coord(7, 1)];
    let idxes = coords.map(c => waveMatrix.toIndex(c.x, c. y));
    let coords1 = idxes.map(n => waveMatrix.toCoord(n));
    expect(coords1).toEqual(coords);

    let coordsX = [new Coord(w, 0), new Coord(-3, h), new Coord(w-h-3, h)];
    coordsX.forEach(c => {
      let n = waveMatrix.toIndex(c.x, c. y);
      let c1 = waveMatrix.toCoord(n);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(w*h);
      expect(c).not.toEqual(c1);
    })
  })
});
