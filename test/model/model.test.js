import {  } from "../../src/model/model";
import assert from 'assert';
import { Matrix, parseMatrix, State, Booster, parseState } from "../../src/model/model";
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

    s.worker.pos.x = 0;
    s.worker.pos.y = 1;

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

    expect(m.getNeighbors(m.toIndex(0, 0))).toEqual([1, 4]);
    expect(m.getNeighbors(m.toIndex(3, 0))).toEqual([2, 7]);
    expect(m.getNeighbors(m.toIndex(1, 1))).toEqual([1, 4, 6, 9]);
    expect(m.getNeighbors(m.toIndex(3, 3))).toEqual([11, 14]);
  })
});
