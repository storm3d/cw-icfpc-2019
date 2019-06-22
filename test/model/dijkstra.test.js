import { Matrix, parseState, Coord } from "../../src/model/model";
import nearestFree from "../../src/model/dijkstra";

describe("Nearest Free Neighbor", () => {
  test("Trivial", () => {
    // const layout = `
    //    | . . . |
    //    | . . . |`;
    // let s = parseState(layout);
    //
    // let path = nearestFree(s, new Coord(0, 0));
    //
    // expect(path).toEqual([new Coord(1, 0)]);
  });

  // test("beyond obstacle", () => {
  //   const layout = `
  //      | * * * |
  //      | * # . |`;
  //   let s = parseState(layout);
  //
  //   let path = nearestFree(s, new Coord(0, 0));
  //
  //   expect(path).toEqual([new Coord(0, 1), new Coord(1, 1), new Coord(2, 1), new Coord(2, 0)]);
  // });
  //
  // test("no reachable free tiles", () => {
  //   const layout = `
  //      | * # * |
  //      | * # . |`;
  //   let s = parseState(layout);
  //
  //   let path = nearestFree(s, new Coord(0, 0));
  //
  //   expect(path).toBeUndefined();
  //
  // });
});
