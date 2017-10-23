import util from 'util';
import ava from 'ava';
import parser from '../../index';

export const parse = (input, transform) => {
    return parser(transform).processSync(input);
};

export function test(spec, input, callback, only = false) {
    let tester = only ? ava.only : ava;
    if (only) {
        let e = new Error();
        console.error(e);
    }

    if (callback) {
        tester(`${spec} (tree)`, t => {
            let tree = parser().astSync(input);
            let debug = util.inspect(tree, false, null);
            callback.call(this, t, tree, debug);
        });
    }

    tester(`${spec} (toString)`, t => {
        let result = parser().processSync(input)
        t.deepEqual(result, input);
    });
}

test.only = (spec, input, callback) => { test(spec, input, callback, true) };

export const throws = (spec, input) => {
    ava(`${spec} (throws)`, t => {
        t.throws(() => parser().processSync(input));
    });
};
