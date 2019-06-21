// @flow
import fs from 'fs'

import { State, OBSTACLE } from '../model/model'

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

    this.fillObstacleCoords(contourClusters)

    const [w, h] = this.getMatrixSize()

    this.state = new State(w, h)
    this.fillWorkerStartPos(initialWorkerPos)
    this.obstaclesCoords.map(([x, y]) => this.state.m.set(x, y, OBSTACLE))

    return this.state
  }

  fillObstacleCoords(contourClusters: string): void {
    contourClusters.split(';')
      .map(contours => this.parseContourBoundaries(contours))
  }

  fillWorkerStartPos(initialWorkerPos: string): void {
    const t = initialWorkerPos.split(',')
    const x = parseInt(t[0].slice(1), 10)
    const y = parseInt(t[1].slice(0, -1), 10)

    this.state.workerPos.x = x
    this.state.workerPos.y = y
  }

  parseContourBoundaries(contours: string): void {
    const contoursCoords = []
    const obstaclesCoords = []
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

    for (let i = 0; i < coords.length; i++) {
      const currX = coords[i][0]
      const currY = coords[i][1]

      this.maxX = currX > this.maxX ? currX : this.maxX
      this.maxY = currY > this.maxY ? currY : this.maxY

      if (i === 0) {
        contoursCoords.push(coords[0])
        continue
      }

      const prevX: number = coords[i - 1][0]
      const prevY: number = coords[i - 1][1]
      const dx: number = currX - prevX
      const dy: number = currY - prevY

      if (dx !== 0) {
        const isGoingRight = dx > 0
        const step = isGoingRight ? 1 : -1

        for (let j = 0; j < Math.abs(dx); j++) {
          const prevContourX = contoursCoords[contoursCoords.length - 1][0]
          const prevContourY = coords[i][1]

          contoursCoords.push([
            prevContourX + step,
            prevContourY
          ])

          if ((prevContourY - 1) < 0) {
            continue
          }

          if (isGoingRight) {
            obstaclesCoords.push([prevContourX + step, prevContourY - 1])
          } else {
            obstaclesCoords.push([prevContourX + step, prevContourY])
          }
        }
      }

      if (dy !== 0) {
        const isGoingUp = dy > 0
        const step = isGoingUp ? 1 : -1

        for (let j = 0; j < Math.abs(dy); j++) {
          const prevContourX = coords[i][0]
          const prevContourY = contoursCoords[contoursCoords.length - 1][1]

          contoursCoords.push([
            prevContourX,
            prevContourY + step
          ])

          if ((prevContourX - 1) < 0) {
            continue
          }

          if (isGoingUp) {
            obstaclesCoords.push([prevContourX, prevContourY])
          } else {
            obstaclesCoords.push([prevContourX, prevContourY - 1])
          }
        }
      }
    }

    this.obstaclesCoords = this.obstaclesCoords.concat(obstaclesCoords)
  }

  getMatrixSize(): Array<number> {
    return [this.maxX + 1, this.maxY + 1]
  }
}