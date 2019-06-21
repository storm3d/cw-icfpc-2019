// @flow
import fs from 'fs'

import { State, OBSTACLE, FREE } from '../model/model'

const COORDS_REGEXP = /\([0-9]+,[0-9]+\)/g

export default class MapParser {
  maxX: number = 0
  maxY: number = 0
  obstaclesCoords: Array<Array<number>> = []
  path: string
  state: State
  content: string
  modelsBasePath: string = `${__dirname}/../../part-1-initial`

  constructor(filename: string) {
    this.path = `${this.modelsBasePath}/${filename}`
    this.content = fs.readFileSync(this.path).toString()
  }

  getState(): State {
    const [contourClusters, initialWorkerPos, obstacles, boosters] = this.content.split('#')
    const map = this.formContoursMap(contourClusters)
    const [w, h] = this.getMatrixSize()

    this.state = new State(w, h)

    for (let y = 0; y <= this.maxY; y++) {
      let paint = OBSTACLE

      for (let x = 0; x <= this.maxX; x++) {
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

    this.state.workerPos.x = x
    this.state.workerPos.y = y
  }

  formContoursMap(contours: string) {
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

      this.maxX = currX > this.maxX ? currX : this.maxX
      this.maxY = currY > this.maxY ? currY : this.maxY

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

    return map
  }

  getMatrixSize(): Array<number> {
    return [this.maxX, this.maxY]
  }
}