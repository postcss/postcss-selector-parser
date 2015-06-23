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

test('extraneous non-combinating whitespace', '  h1   ,  h2   ', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.equal(tree.nodes[1].nodes[0].value, 'h2');
    t.equal(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[1].nodes[0].spaces.after, '   ');
});

test('tag with trailing comma', 'h1,', (t, tree) => {
    t.plan(1);
    t.equal(tree.trailingComma, true);
});
