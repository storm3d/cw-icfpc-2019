import assert from 'assert';

// import { State } from '../src/model/model';
// import MapSerializer from '../../src/model/mapSerializer';
import MapParser from '../../src/model/mapParser';
import MapSerializer from '../../src/model/mapSerializer';

describe('mapSerializer test', () => {
  test('Selialized map path should be equal to input', () => {
    const path = '(1,0),(3,0),(3,1),(4,1),(4,4),(0,4),(0,1),(1,1)';
    const expected = [
      '| . . . . |',
      '| . . . . |',
      '| . . . . |',
      '| # . . # |',
      ''
    ].join('\n');
    const state = new MapParser('', path).getState();
    const mapDump = state.dump();
    const mapSerializer = new MapSerializer(state);
    const serializedPath = mapSerializer.dump();

    assert.strictEqual(mapDump, expected);
    assert.strictEqual(serializedPath, path);
  });
});
