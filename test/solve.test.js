import Solver from "../src/solve";
import { parseState } from "../src/model/model";

describe("solver", () => {

  test("test basic solve", () => {
    const layout = `
        | . . . |
        | . # # |
        | . . . |
        | W . . |`;
    let s = parseState(layout);
    expect(s.m.getFreeNum()).toEqual(9);

    let solver = new Solver(s);
    let solution = solver.solve();

    expect(solver.state.m.getFreeNum()).toEqual(0);
    expect(solution.getString().length).toEqual(9);
  })

});