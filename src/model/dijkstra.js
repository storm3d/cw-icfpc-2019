//@flow

import {Matrix, Coord, State} from "./model";

const maxSearchLen = 25;

// dijkstra solve graph starting at s
// from https://gist.github.com/jpillora/7382441
function solve(graph, s) {
  let solutions = {};
  solutions[s] = {
    path: [],
    dist: 0
  };

  while(true) {
    let parent = null;
    let nearest = null;
    let dist = Infinity;

    // for each existing getString
    for(let n in solutions) {
      if(!solutions[n])
        continue;
      let ndist = solutions[n].dist;
      let adj = graph[n];
      // for each of its adjacent nodes...
      for(let a in adj) {
        // without a getString already...
        if(solutions[a])
          continue;
        // choose nearest node with lowest *total* cost
        let d = adj[a] + ndist;
        if(d < dist) {
          // reference parent
          parent = solutions[n];
          nearest = a;
          dist = d;
        }
      }
    }

    // no more solutions
    if(dist === Infinity) {
      break;
    }

    // extend parent's getString path
    if (!solutions[nearest])
      solutions[nearest] = {};

    solutions[nearest].path = parent.path.concat(nearest);
    // extend parent's cost
    solutions[nearest].dist = dist;
  }

  return solutions;
}

// create graph
// let graph = {};
//
// let layout = {
//   'R': ['2'],
//   '2': ['3','4'],
//   '3': ['4','6','13'],
//   '4': ['5','8'],
//   '5': ['7','11'],
//   '6': ['13','15'],
//   '7': ['10'],
//   '8': ['11','13'],
//   '9': ['14'],
//   '10': [],
//   '11': ['12'],
//   '12': [],
//   '13': ['14'],
//   '14': [],
//   '15': []
// };

// convert uni-directional to bi-directional graph
// needs to look like: where: { a: { b: cost of a->b }
// var graph = {
//     a: {e:1, b:1, g:3},
//     b: {a:1, c:1},
//     c: {b:1, d:1},
//     d: {c:1, e:1},
//     e: {d:1, a:1},
//     f: {g:1, h:1},
//     g: {a:3, f:1},
//     h: {f:1}
// };

// for(let id in layout) {
//   if(!graph[id])
//     graph[id] = {};
//   layout[id].forEach((aid) => {
//     graph[id][aid] = 1;
//     if(!graph[aid])
//       graph[aid] = {};
//     graph[aid][id] = 1;
//   });
// }
//
// // choose start node
// let start = '10';
// // get all solutions
// let solutions = solve(graph, start);
//
// console.log(`From '${start}' to`);
// // display solutions
// for(let s in solutions) {
//   if(!solutions[s]) continue;
//   console.log(` -> ${  s  }: [${  solutions[s].path.join(", ")  }]   (dist:${  solutions[s].dist  })`);
// }

// From '10' to
//  -> 2: [7, 5, 4, 2]   (dist:4)
//  -> 3: [7, 5, 4, 3]   (dist:4)
//  -> 4: [7, 5, 4]   (dist:3)
//  -> 5: [7, 5]   (dist:2)
//  -> 6: [7, 5, 4, 3, 6]   (dist:5)
//  -> 7: [7]   (dist:1)
//  -> 8: [7, 5, 4, 8]   (dist:4)
//  -> 9: [7, 5, 4, 3, 13, 14, 9]   (dist:7)
//  -> 10: []   (dist:0)
//  -> 11: [7, 5, 11]   (dist:3)
//  -> 12: [7, 5, 11, 12]   (dist:4)
//  -> 13: [7, 5, 4, 3, 13]   (dist:5)
//  -> 14: [7, 5, 4, 3, 13, 14]   (dist:6)
//  -> 15: [7, 5, 4, 3, 6, 15]   (dist:6)
//  -> R: [7, 5, 4, 2, R]   (dist:5)

function matrixToGraph(m: Matrix) {
  let c: Coord;
  let graph = {};
  let mem = [];
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      let n = m.toIndex(x, y);
      let nx1 = m.toIndex(x - 1, y);
      let nx2 = m.toIndex(x + 1, y);
      let ny1 = m.toIndex(x, y - 1);
      let ny2 = m.toIndex(x, y + 1);
      graph[n] = {};
      
      if (!mem.includes(nx1)) {
        mem[nx1] = m.isValid(x - 1, y) && !m.isObstacle(x - 1, y);
      }
      if (!mem.includes(nx2)) {
        mem[nx2] = m.isValid(x + 1, y) && !m.isObstacle(x + 1, y);
      }
      if (!mem.includes(ny1)) {
        mem[ny1] = m.isValid(x, y - 1) && !m.isObstacle(x, y - 1);
      }
      if (!mem.includes(ny2)) {
        mem[ny2] = m.isValid(x, y + 1) && !m.isObstacle(x, y + 1);
      }

      if (mem[nx1]) graph[n][nx1] = 1;
      if (mem[nx2]) graph[n][nx2] = 1;
      if (mem[ny1]) graph[n][ny1] = 1;
      if (mem[ny2]) graph[n][ny2] = 1;
    }
  }
  return graph;
}

function breadthSearch(s: State, source: Coord, hasDrill: boolean) {

  let lens = new Matrix(s.m.w, s.m.h);
  let front = new Array(source.getCopy());
  lens.set(source.x, source.y, 1)

  let nearestFree : Coord = 0;

  while(front.length) {
    let c = front[0];
    let curLen = lens.get(c.x, c.y);

    // exceeded the search radius - go to just a free cell
    if(curLen >= maxSearchLen && nearestFree !== 0) {
      //console.log("exceeded range");
      break;
    }

    front.shift();

    let nx = c.x + 1;
    let ny = c.y;

    if(s.m.isValid(nx, ny)) {
      if (s.checkBooster(nx, ny)) {
        nearestFree = new Coord(nx, ny);
        break;
      }
      if (s.m.isFree(nx, ny) && nearestFree === 0) {
        nearestFree = new Coord(nx, ny);
      }
      if (s.m.isPassable(nx, ny) && lens.get(nx, ny) === 0) {
        front.push(new Coord(nx, ny));
        lens.set(nx, ny, curLen + 1);
      }
    }

    nx = c.x;
    ny = c.y + 1;

    if(s.m.isValid(nx, ny)) {
      if (s.checkBooster(nx, ny)) {
        nearestFree = new Coord(nx, ny);
        break;
      }
      if (s.m.isFree(nx, ny) && nearestFree === 0) {
        nearestFree = new Coord(nx, ny);
      }
      if (s.m.isPassable(nx, ny) && lens.get(nx, ny) === 0) {
        front.push(new Coord(nx, ny));
        lens.set(nx, ny, curLen + 1);
      }
    }

    nx = c.x - 1;
    ny = c.y;

    if(s.m.isValid(nx, ny)) {
      if (s.checkBooster(nx, ny)) {
        nearestFree = new Coord(nx, ny);
        break;
      }
      if (s.m.isFree(nx, ny) && nearestFree === 0) {
        nearestFree = new Coord(nx, ny);
      }
      if (s.m.isPassable(nx, ny) && lens.get(nx, ny) === 0) {
        front.push(new Coord(nx, ny));
        lens.set(nx, ny, curLen + 1);
      }
    }

    nx = c.x;
    ny = c.y - 1;

    if(s.m.isValid(nx, ny)) {
      if (s.checkBooster(nx, ny)) {
        nearestFree = new Coord(nx, ny);
        break;
      }
      if (s.m.isFree(nx, ny) && nearestFree === 0) {
        nearestFree = new Coord(nx, ny);
      }
      if (s.m.isPassable(nx, ny) && lens.get(nx, ny) === 0) {
        front.push(new Coord(nx, ny));
        lens.set(nx, ny, curLen + 1);
      }
    }

    //console.log("front");
    //console.log(front);
  }

  //console.log(nearestFree);

  if(nearestFree === 0)
    return undefined;

  let path = [ nearestFree ];
  while(true) {
   //console.log(path);

    let c = path[path.length - 1];
    let minL = 999999;
    let minC = 0;

    let nx = c.x + 1;
    let ny = c.y;
    if(source.x === nx && source.y === ny)
      break;
    if(lens.get(nx, ny) < minL && lens.get(nx, ny) !== 0 && lens.isValid(nx, ny)) {
      minL = lens.get(nx, ny);
      minC = new Coord(nx, ny);
    }

    nx = c.x;
    ny = c.y + 1;
    if(source.x === nx && source.y === ny)
      break;
    if(lens.get(nx, ny) < minL && lens.get(nx, ny) !== 0 && lens.isValid(nx, ny)) {
      minL = lens.get(nx, ny);
      minC = new Coord(nx, ny);
    }

    nx = c.x - 1;
    ny = c.y;
    if(source.x === nx && source.y === ny)
      break;
    if(lens.get(nx, ny) < minL && lens.get(nx, ny) !== 0 && lens.isValid(nx, ny)) {
      minL = lens.get(nx, ny);
      minC = new Coord(nx, ny);
    }

    nx = c.x;
    ny = c.y - 1;
    if(source.x === nx && source.y === ny)
      break;
    if(lens.get(nx, ny) < minL && lens.get(nx, ny) !== 0 && lens.isValid(nx, ny)) {
      minL = lens.get(nx, ny);
      minC = new Coord(nx, ny);
    }

    if(!minC)
      throw "Weird shit happened";

    path.push(minC);
  }

  return path.reverse();
}

export default function pathToNearestFreePoint(s: State, source: Coord,hasDrill: boolean) {

  return breadthSearch(s, source, hasDrill);

  /*

  if (m.isValid(source.x + 1, source.y) && m.isFree(source.x + 1, source.y))
    return [new Coord(source.x + 1, source.y)];

  if (m.isValid(source.x, source.y + 1) && m.isFree(source.x, source.y + 1))
    return [new Coord(source.x, source.y + 1)];

  if (m.isValid(source.x - 1, source.y) && m.isFree(source.x - 1, source.y))
    return [new Coord(source.x - 1, source.y)];

  if (m.isValid(source.x, source.y - 1) && m.isFree(source.x, source.y - 1))
    return [new Coord(source.x, source.y - 1)];

  let graph = matrixToGraph(m);

  let solutions = solve(graph, m.coord2index(source));

  let nearestDistance = Infinity;
  let shortestPath = undefined;

  for (let s in solutions) {
    if(!solutions[s] || solutions[s].dist === 0) continue;

    if (solutions[s].dist < nearestDistance && m.isFreeIndex(s)) {
      nearestDistance = solutions[s].dist;
      shortestPath = solutions[s].path;
    }
  }
  if (shortestPath) {
    shortestPath = shortestPath.map( i => m.index2Coord(i));
  }

  return shortestPath;

   */
}
