import assert from 'assert';
import { Rover, Coord, parseCoords } from "../../src/model/model";

describe("Rover model", () => {
  test("parseCoords", () => {

    let coords = parseCoords("(1, 2),(  3, 7) , (  -90 ,   34)");

    expect(coords).toEqual([new Coord(1, 2), new Coord(3, 7), new Coord(-90, 34)]);

  });

  test("Without rotation", () => {

    let rover = new Rover(new Coord(2, 5), 1, 1);

    expect(rover.pos).toEqual(new Coord(2, 5));
    expect(rover.getManipulators()).toEqual(parseCoords("(1, 1),(1, 0),(1, -1)"))
  });

  test("Rotate 90 clock wise", () => {

    let rover = new Rover(new Coord(2, 5), 1, 1);

    rover.rotCW();
    expect(rover.pos).toEqual(new Coord(2, 5));
    expect(rover.getManipulators()).toEqual(parseCoords("(1, -1),(0, -1),(-1, -1)"))
  });

  test("Rotate 90 counter clock wise", () => {

    let rover = new Rover(new Coord(2, 5), 1, 1);

    rover.rotCCW();
    expect(rover.pos).toEqual(new Coord(2, 5));
    expect(rover.getManipulators()).toEqual(parseCoords("(-1, 1),(0, 1),(1, 1)"))
  });

  test("Extend manipulators", () => {

    let rover = new Rover(new Coord(2, 5), 1, 1);

    expect(rover.getManipulators()).toEqual(parseCoords("(1, 1),(1, 0),(1, -1)"));

    rover.extendManipulators();
    expect(rover.getManipulators()).toEqual(parseCoords("(1, 2),(1, 1),(1, 0),(1, -1)"));

    rover.extendManipulators();
    expect(rover.getManipulators()).toEqual(parseCoords("(1, 2),(1, 1),(1, 0),(1, -1),(1, -2)"));

    rover.extendManipulators();
    expect(rover.getManipulators()).toEqual(parseCoords("(1, 3),(1, 2),(1, 1),(1, 0),(1, -1),(1, -2)"));
  });

});
