// @flow
import fs from 'fs'

import { State, OBSTACLE, FREE } from '../model/model'

const COORDS_REGEXP = /\([0-9]+,[0-9]+\)/g

export default class MapParser {
  obstaclesCoords: Array<Array<number>> = [];
  path: string;
  state: State;
  content: string;

  constructor(filename: string) {
      console.log('filename:', filename);
    this.content = fs.readFileSync(filename).toString();
  }

  getState(): State {
    const [contourClusters, initialWorkerPos, obstacles, boosters] = this.content.split('#')
    const { map, maxY, maxX } = this.formContoursMap(contourClusters)
    // const { map: obstaclesMap } = this.formContoursMap(obstacles)

    // console.log(obstaclesMap)

    this.state = new State(maxX, maxY)

    for (let y = 0; y <= maxY; y++) {
      let paint = OBSTACLE

      for (let x = 0; x <= maxX; x++) {
        if (map[x] && map[x].find(([startY, endY]) => startY <= y && y < endY)) {
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

  formContoursMap(contours: string) {
    let maxX = 0
    let maxY = 0
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

    // Adds start coords in the end for closure
    coords.push(coords[0])

    const map = {};

    for (let i = 0; i < coords.length; i++) {
      const currX = coords[i][0]
      const currY = coords[i][1]

      maxX = currX > maxX ? currX : maxX
      maxY = currY > maxY ? currY : maxY

      if (i === 0) {
        continue
      }

      const prevX = coords[i - 1][0]
      const prevY = coords[i - 1][1]

      if (prevX === currX) {
        if (!map[currX]) {
          map[currX] = []
        }

        map[currX].push([currY, prevY].sort((a, b) => a - b))
      }
    }

    return { maxX, maxY, map }
  }
}