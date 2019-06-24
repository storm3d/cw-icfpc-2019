import Solver, { pixelCost } from "../src/solve";
import { parseState, parseMatrix } from "../src/model/model";
import MapParser from '../src/model/mapParser';

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
    //expect(solution.getString().length).toEqual(10);
  })

  test("gather boosters", () => {
    const layout = `
        | R F B |
        | X # # |
        | L . F |
        | W B R |`;
    let s = parseState(layout);
    expect(s.m.getFreeNum()).toEqual(8);
    expect(s.boosters.length).toEqual(8);

    let solver = new Solver(s);
    let solution = solver.solve();

    expect(solver.state.m.getFreeNum()).toEqual(0);
    //console.log(solution.getString());

    expect(solution.getString().length).toEqual(22); // DB(1,2)DAAQWWWEDDB(1,-2)

    //console.log(solver.state.dump());
    expect(solver.state.dump()).toEqual(`| * * W |
| X # # |
| * * F |
| * * R |
`);
    //solver.state.step+=10;
    expect(solver.state.getAvailableInventoryBoosters('B', 0)).toEqual(0);
    expect(solver.state.getAvailableInventoryBoosters('L', 0)).toEqual(1);
    expect(solver.state.getAvailableInventoryBoosters('R', 0)).toEqual(1);
    expect(solver.state.getAvailableInventoryBoosters('F', 0)).toEqual(1);

  })

  test("test drills", () => {
    const layout = `
        | * * * * * * * * * * |
        | * # # # # # # # # * |
        | * # * * * * * * # . |
        | * # * # # # # * * # |
        | * # * # * * * # * * |
        | * # * # W L * * # * |
        | * # * # # # # * # * |
        | * # * * * * * * # * |
        | * # # # # # # # # * |
        | B * * * * * * * * * |`;
    let s = parseState(layout);

    let solver = new Solver(s);
    let solution = solver.solve();

    expect(solver.state.m.getFreeNum()).toEqual(0);
    expect(solver.solution.score).toEqual(39);
    expect(solution.getString().length).toEqual(44);
    expect(solver.state.getAvailableInventoryBoosters('B', 0)).toEqual(0);
    expect(solver.state.getAvailableInventoryBoosters('F', 0)).toEqual(0);
    expect(solver.state.getAvailableInventoryBoosters('L', 0)).toEqual(1);
    expect(solver.state.getAvailableInventoryBoosters('R', 0)).toEqual(0);
    //console.log(solution);

    //console.log(solution.getString());
    //console.log(solution.getString().length);
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

    // console.log(solution);

    //console.log(solution.getString());
    //console.log(solution.getString().length);
  })

  test("test solve fasts", () => {
    const s = new MapParser('./problems/prob-012.desc').getState();

    let solver = new Solver(s);
    let solution = solver.solve();

    expect(solver.state.m.getFreeNum()).toEqual(0);
    expect(solver.solution.score).toEqual(543);
    expect(solver.state.getAvailableInventoryBoosters('B', 0)).toEqual(0);
    expect(solver.state.getAvailableInventoryBoosters('F', 0)).toEqual(1);
    expect(solver.state.getAvailableInventoryBoosters('L', 0)).toEqual(0);
    expect(solver.state.getAvailableInventoryBoosters('R', 0)).toEqual(0);
    expect(solver.state.getAvailableInventoryBoosters('C', 0)).toEqual(0);

    // console.log(solution);

    //console.log(solution.getString());
    //console.log(solution.getString().length);
  })

  test("test DFS FreeNum", () => {
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
    let solution = solver.solve_DFS_FreeNum();

    // console.log(solution);

    //console.log(solution.getString());
    //console.log(solution.getString().length);
  })

  // test("Cost function", () => {
  //   let layout = `
  //     | . . * . |
  //     | . . * * |
  //     | . . . . |
  //     | * . # . |
  //   `;
  //
  //   let m = parseMatrix(layout);
  //
  //   expect(pixelCost(m, 0, 0)).toEqual(0);
  //   expect(pixelCost(m, 1, 1)).toEqual(2);
  //   expect(pixelCost(m, 1, 0)).toEqual(1 + 0.5 * 2 + 0.1 * 1);
  //   expect(pixelCost(m, 3, 0)).toEqual(1 + 0.5 * 3 + 0.1 * 0);
  // })
});
