import parser from '../../index';
import ava from 'ava';
import util from 'util';

export let parse = (input, transform) => {
    return parser(transform).process(input).result;
};

export let test = (spec, input, callback) => {
    let tree;

    let result = parse(input, (selectors) => tree = selectors);

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

export let throws = (spec, input) => {
    ava(`${spec} (throws)`, t => {
        t.throws(() => parser().process(input).result);
    });
};
