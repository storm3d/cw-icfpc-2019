import assert from 'assert';
import MapParser from '../../src/model/mapParser';

describe("mapParser test", () => {
  test("draw contours boundaries map from custom content", () => {
    const expected = [
      '| . . # . . . # # |',
      '| . # . . . . . . |',
      '| W . . . . . # # |',
      ''
    ].join('\n');

    const state = new MapParser('', '(0,0),(6,0),(6,1),(8,1),(8,2),(6,2),(6,3),(0,3)#(0,0)#(2,2),(2,3),(3,3),(3,2);(1,1),(1,2),(2,2),(2,1)#').getState();
    assert.strictEqual(state.dump(), expected);

  });

  test("draw contours boundaries map 'prob-001.desc'", () => {
    const expected = [
      '| . . . . . . # # |',
      '| . . . . . . . . |',
      '| W . . . . . # # |',
      ''
    ].join('\n');
    const state = new MapParser('./part-1-initial/prob-001.desc').getState();

    assert.strictEqual(state.dump(), expected)
  })

  test("draw contours boundaries map 'prob-002.desc'", () => {
    const expected = [
      '| # # # # # # . . . |',
      '| . . . . . . # # . |',
      '| . . . . . . . . # |',
      '| W . . . . . # # . |',
      '',
    ].join('\n')
    const state = new MapParser('./part-1-initial/prob-002.desc').getState()

    //console.log(state.dump());
    // assert.strictEqual(state.dump(), expected)
  })

})
