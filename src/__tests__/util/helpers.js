'use strict';

import parser from '../../index';
import tape from 'tape';
import util from 'util';

export let parse = (input, transform) => {
    return parser(transform).process(input).result;
};

export let test = (spec, input, callback) => {
    var tree;

    let result = parse(input, (selectors) => {tree = selectors});

    if (callback) {
        tape(`${spec} (tree)`, (t) => {
            let debug = util.inspect(tree, false, null);
            callback.call(this, t, tree, debug);
        });
    }

    tape(`${spec} (toString)`, (t) => {
        t.plan(1);
        t.equal(result, input);
    });
};

export let throws = (spec, input) => {
    tape(`${spec} (throws)`, (t) => {
        t.plan(1);
        t.throws(() => {
            return parser().process(input).result;
        });
    });
};
