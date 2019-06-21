import { Matrix, parseMatrix, Coord } from "../../src/model/model";
import nearestFree from "../../src/model/dijkstra";

describe("Nearest Free Neighbor", () => {
  test("Trivial", () => {
    const layout = `
       | . . . |
       | . . . |`;
    let m = parseMatrix(layout);

    let path = nearestFree(m, new Coord(0, 0));

    expect(path.length).toEqual(1);
  });

  test("beyond obstacle", () => {
    const layout = `
       | * * * |
       | * # . |`;
    let m = parseMatrix(layout);

    let path = nearestFree(m, new Coord(0, 0));

    expect(path).toEqual(["3", "4", "5", "2"]);

  });
});
