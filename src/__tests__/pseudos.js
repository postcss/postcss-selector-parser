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
    t.equal(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, 'heading');
});

test('negation pseudo element (2)', 'h1:not(.heading, .title, .content)', (t, tree) => {
    t.plan(4);
    t.equal(tree.nodes[0].nodes[1].value, ':not');
    t.equal(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, 'heading');
    t.equal(tree.nodes[0].nodes[1].nodes[1].nodes[0].value, 'title');
    t.equal(tree.nodes[0].nodes[1].nodes[2].nodes[0].value, 'content');
});

test('negation pseudo element (3)', 'h1:not(.heading > .title) > h1', (t, tree) => {
    t.plan(5);
    t.equal(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, 'heading');
    t.equal(tree.nodes[0].nodes[1].nodes[0].nodes[1].value, '>');
    t.equal(tree.nodes[0].nodes[1].nodes[0].nodes[2].value, 'title');
    t.equal(tree.nodes[0].nodes[2].value, '>');
    t.equal(tree.nodes[0].nodes[3].value, 'h1');
});

test('negation pseudo element (4)', 'h1:not(h2:not(h3))', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[1].nodes[0].nodes[1].nodes[0].nodes[0].value, 'h3');
    t.equal(tree.nodes[0].nodes[1].nodes[0].nodes[1].nodes[0].nodes[0].parent.type, 'selector');
});

test('extraneous non-combinating whitespace', '  h1:after   ,  h2:after   ', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[0].nodes[1].value, ':after');
    t.equal(tree.nodes[0].nodes[1].spaces.after, '   ');
    t.equal(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[1].nodes[1].value, ':after');
    t.equal(tree.nodes[1].nodes[1].spaces.after, '   ');
});
