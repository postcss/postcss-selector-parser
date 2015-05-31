'use strict';

import {test} from './util/helpers';

test('tag selector', 'h1', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].type, 'tag');
});

test('multiple tag selectors', 'h1, h2', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[1].nodes[0].value, 'h2');
});

