'use strict';

import {test} from './util/helpers';

test('class name', '.one', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].value, 'one');
    t.equal(tree.nodes[0].nodes[0].type, 'class');
});

test('multiple class names', '.one.two.three', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, 'one');
    t.equal(tree.nodes[0].nodes[1].value, 'two');
    t.equal(tree.nodes[0].nodes[2].value, 'three');
});

test('qualified class', 'button.btn-primary', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].type, 'tag');
    t.equal(tree.nodes[0].nodes[1].type, 'class');
});

test('escaped numbers in class name', '.\\31\\ 0', (t, tree, d) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].type, 'class');
    t.equal(tree.nodes[0].nodes[0].value, '\\31\\ 0');
});

test('extraneous non-combinating whitespace', '  .h1   ,  .h2   ', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.equal(tree.nodes[1].nodes[0].value, 'h2');
    t.equal(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[1].nodes[0].spaces.after, '   ');
});
