import assert from 'assert';

import MapParser from '../../src/model/mapParser';
import MapSerializer from '../../src/model/mapSerializer';

describe('mapSerializer test', () => {
  test('Selialized map path should be equal to input', () => {
    const path = '(1,0),(3,0),(3,1),(4,1),(4,4),(0,4),(0,1),(1,1)#(1,0)##';
    const expected = [
      '| . . . . |',
      '| . . . . |',
      '| . . . . |',
      '| # W . # |',
      ''
    ].join('\n');
    const state = new MapParser('', path).getState();
    const mapDump = state.dump();
    const mapSerializer = new MapSerializer(state.m, state.workers[0]);
    const serializedPath = mapSerializer.dump();

    assert.strictEqual(serializedPath, path);
  });

  test('Selialized map path should be equal to input `prob-001.desc`', () => {
    const state = new MapParser('./problems/prob-001.desc').getState();
    const mapDump = state.dump();
    const mapSerializer = new MapSerializer(state.m, state.workers[0]);
    const serializedPath = mapSerializer.dump();

    assert.strictEqual(serializedPath, '(0,0),(6,0),(6,1),(8,1),(8,2),(6,2),(6,3),(0,3)#(0,0)##');
    // assert.strictEqual(serializedPath, path);
  });

  // test('Selialized map path should be equal to input `prob-002.desc`', () => {
  //   const state = new MapParser('./problems/prob-002.desc').getState();
  //   const mapDump = state.dump();
  //   const mapSerializer = new MapSerializer(state.m, state.worker);
  //   const serializedPath = mapSerializer.dump();
  //
  //   console.log(mapDump, serializedPath);
  //
  //   // assert.strictEqual(serializedPath, '(0,0),(6,0),(6,1),(8,1),(8,2),(6,2),(6,3),(0,3)#(0,0)##');
  //   // assert.strictEqual(serializedPath, path);
  // });
});
