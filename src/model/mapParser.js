// @flow
import fs from 'fs'

import { State, OBSTACLE, FREE } from '../model/model'

const COORDS_REGEXP = /\([0-9]+,[0-9]+\)/g

export default class MapParser {
  obstaclesCoords: Array<Array<number>> = [];
  path: string;
  state: State;
  content: string;

  constructor(filename: string, content : string = "") {

    if(content !== "") {
      this.content = content;
    }
    else {
      this.content = fs.readFileSync(filename).toString();
    }
  }

  getState(): State {
    const [contourClusters, initialWorkerPos, obstacles, boosters] = this.content.split('#')

    //console.log(contourClusters);
    //console.log(obstacles);

    let obj = {
      map : {},
      maxX : 0,
      maxY : 0
    };
    this.formContoursMap(contourClusters, obj);

    let obstaclesArr = obstacles.split(';');
    obstaclesArr.forEach(o => this.formContoursMap(o, obj));

    //console.log(obstaclesArr)

    this.state = new State(obj.maxX, obj.maxY)

    for (let y = 0; y <= obj.maxY; y++) {
      let paint = OBSTACLE

      for (let x = 0; x <= obj.maxX; x++) {
        if (obj.map[x] && obj.map[x].find(([startY, endY]) => startY <= y && y < endY)) {
          paint = paint === OBSTACLE ? FREE : OBSTACLE
        }

        this.state.m.set(x, y, paint)
      }
    }

    this.fillWorkerStartPos(initialWorkerPos)

    return this.state
  }

  fillWorkerStartPos(initialWorkerPos: string): void {
    const t = initialWorkerPos.split(',')
    const x = parseInt(t[0].slice(1), 10)
    const y = parseInt(t[1].slice(0, -1), 10)

    this.state.worker.pos.x = x
    this.state.worker.pos.y = y
  }

  formContoursMap(contours: string, obj) {

    const matches = contours.match(COORDS_REGEXP)

    if (!matches) {
      return
    }

    const coords = matches.map((str) => {
      const t = str.split(',')
      const x = parseInt(t[0].slice(1), 10)
      const y = parseInt(t[1].slice(0, -1), 10)

      return [x, y]
    })

    //console.log(coords);

    // Adds start coords in the end for closure
    coords.push(coords[0])

    for (let i = 0; i < coords.length; i++) {
      const currX = coords[i][0]
      const currY = coords[i][1]

      obj.maxX = currX > obj.maxX ? currX : obj.maxX
      obj.maxY = currY > obj.maxY ? currY : obj.maxY

      if (i === 0) {
        continue
      }

      const prevX = coords[i - 1][0]
      const prevY = coords[i - 1][1]

      if (prevX === currX) {
        if (!obj.map[currX]) {
          obj.map[currX] = []
        }

        obj.map[currX].push([currY, prevY].sort((a, b) => a - b))
      }
    }
  }
}