'use strict';

import {test} from './util/helpers';

test('pseudo element (single colon)', 'h1:after', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].type, 'tag');
    t.equal(tree.nodes[0].nodes[1].type, 'pseudo');
    t.equal(tree.nodes[0].nodes[1].value, ':after');
});

test('pseudo element (double colon)', 'h1::after', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].type, 'tag');
    t.equal(tree.nodes[0].nodes[1].type, 'pseudo');
    t.equal(tree.nodes[0].nodes[1].value, '::after');
});

test('multiple pseudo elements', '*:target::before, a:after', (t, tree) => {
    t.plan(4);
    t.equal(tree.nodes[0].nodes[0].value, '*');
    t.equal(tree.nodes[0].nodes[1].value, ':target');
    t.equal(tree.nodes[0].nodes[2].value, '::before');
    t.equal(tree.nodes[1].nodes[1].value, ':after');
});

test('negation pseudo element', 'h1:not(.heading)', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[1].value, ':not');
    t.equal(tree.nodes[0].nodes[1].nodes[0].value, 'heading');
});
