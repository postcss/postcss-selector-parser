'use strict';

import parser from '../../index';
import tape from 'tape';
import util from 'util';

export let test = (spec, input, callback) => {
    var tree;

    let result = parser((selectors) => {
        tree = selectors
    }).process(input).result;

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
            return parser(() => {}).process(input).result;
        });
    });
};
