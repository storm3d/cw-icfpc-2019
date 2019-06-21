import assert from 'assert';
import MapParser from '../../src/model/mapParser';

describe("mapParser test", () => {
  test("draw contours boundaries map 'prob-001.desc'", () => {
    const expected = [
      '| . . . . . . # # |',
      '| . . . . . . . . |',
      '| W . . . . . # # |',
      ''
    ].join('\n')
    const state = new MapParser('prob-001.desc').getState()

    assert.strictEqual(state.dump(), expected)
  })

  // test("draw contours boundaries map 'prob-002.desc'", () => {
  //   const expected = [
  //     '| # # # # # # . . . |',
  //     '| . . . . . . # # . |',
  //     '| . . . . . . . . # |',
  //     '| W . . . . . # # . |',
  //     '',
  //   ].join('\n')
  //   const state = new MapParser('prob-002.desc').getState()
  //
  //   // assert.strictEqual(state.dump(), expected)
  // })
})
