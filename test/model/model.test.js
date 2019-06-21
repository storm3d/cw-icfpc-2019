import {  } from "../../src/model/model";
import assert from 'assert';
import { Matrix, parseMatrix } from "../../src/model/model";
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
      `| . . |\n| x # |\n`;
    expect(m.dump()).toEqual(one);
  })

  test("Matrix parse+dump", () => {
    const layout = `| . # # |
| . # # |
| . . . |
| x . . |
`;
    let m = parseMatrix(layout);
    expect(m.dump()).toEqual(layout);
  })
});
