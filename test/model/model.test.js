import {  } from "../../src/model/model";
import assert from 'assert';
import { Matrix, parseMatrix, State, Booster, parseState } from "../../src/model/model";
import { WRAPPED, OBSTACLE } from "../../src/model/model";

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

  test("State dump", () => {

    let s = new State(2, 2);

    s.m.set(0, 0, WRAPPED);
    s.m.set(1, 0, OBSTACLE);

    s.workerPos.x = 0;
    s.workerPos.y = 1;

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

  test("State parse empty", () => {

    const layout = `
        | . . . . |
        | . . . . |
        `;
    let s = parseState(layout);
    expect(s.m.w).toEqual(4);
    expect(s.m.h).toEqual(2);
  });

});
