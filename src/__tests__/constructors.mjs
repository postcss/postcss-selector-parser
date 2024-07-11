import test from 'ava';
import parser from '../index.js';

test('constructors#nesting', (t) => {
    t.deepEqual(parser.nesting().toString(), '&');
    t.deepEqual(parser.nesting({}).toString(), '&');
});
