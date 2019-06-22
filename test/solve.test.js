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
    expect(s.m.getFreeNum()).toEqual(8);

    let solver = new Solver(s);
    let solution = solver.solve();

    expect(solver.state.m.getFreeNum()).toEqual(0);
    expect(solution.getString().length).toEqual(10);
  })

  test("gather boosters", () => {
    const layout = `
        | R F B |
        | X # # |
        | L . F |
        | W B R |`;
    let s = parseState(layout);
    expect(s.m.getFreeNum()).toEqual(8);

    let solver = new Solver(s);
    let solution = solver.solve();

    expect(solver.state.m.getFreeNum()).toEqual(0);
    expect(solution.getString().length).toEqual(26);

    expect(solver.state.dump()).toEqual(`| * * W |
| X # # |
| * * * |
| * * * |
`);
    expect(solver.state.extensions).toEqual(0);
    expect(solver.state.fasts).toEqual(2);
    expect(solver.state.drills).toEqual(1);
    expect(solver.state.teleports).toEqual(2);

  })

  test("test basic solve1", () => {
    const layout = `
        | . . . . . . . . . . |
        | . . . . . # . . . . |
        | . . . . . . . . . . |
        | . . . . # # . . . . |
        | . . . . # # . . . . |
        | . . . . # # . . . . |
        | . . . . # # . . . . |
        | B . . . # # . . . . |
        | . . . . . . . . . . |
        | W . . . . . . . . . |`;
    let s = parseState(layout);

    let solver = new Solver(s);
    let solution = solver.solve();

    console.log(solution);

    //console.log(solution.getString());
    //console.log(solution.getString().length);
  })

});