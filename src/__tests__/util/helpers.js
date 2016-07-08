import util from 'util';
import ava from 'ava';
import parser from '../../index';

export const parse = (input, transform) => {
    return parser(transform).process(input).result;
};

export const test = (spec, input, callback) => {
    let tree;

    let result = parse(input, (selectors) => (tree = selectors));

    if (callback) {
        ava(`${spec} (tree)`, t => {
            let debug = util.inspect(tree, false, null);
            callback.call(this, t, tree, debug);
        });
    }

    ava(`${spec} (toString)`, t => {
        t.deepEqual(result, input);
    });
};

export const throws = (spec, input) => {
    ava(`${spec} (throws)`, t => {
        t.throws(() => parser().process(input).result);
    });
};
