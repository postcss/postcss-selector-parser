import test from './util/runner.mjs';
import parser from '../../dist/index.js';

test('constructors#nesting', (t) => {
    t.deepEqual(parser.nesting().toString(), '&');
    t.deepEqual(parser.nesting({}).toString(), '&');
});
