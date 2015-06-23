'use strict';

import {test} from './util/helpers';

test('id selector', '#one', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].value, 'one');
    t.equal(tree.nodes[0].nodes[0].type, 'id');
});

test('id hack', '#one#two', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].type, 'id');
    t.equal(tree.nodes[0].nodes[1].type, 'id');
});

test('id and class names mixed', '#one.two.three', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[0].value, 'one');
    t.equal(tree.nodes[0].nodes[1].value, 'two');
    t.equal(tree.nodes[0].nodes[2].value, 'three');

    t.equal(tree.nodes[0].nodes[0].type, 'id');
    t.equal(tree.nodes[0].nodes[1].type, 'class');
    t.equal(tree.nodes[0].nodes[2].type, 'class');
});

test('qualified id', 'button#one', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].type, 'tag');
    t.equal(tree.nodes[0].nodes[1].type, 'id');
});

test('qualified id & class name', 'h1#one.two', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].type, 'tag');
    t.equal(tree.nodes[0].nodes[1].type, 'id');
    t.equal(tree.nodes[0].nodes[2].type, 'class');
});

test('extraneous non-combinating whitespace', '  #h1   ,  #h2   ', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.equal(tree.nodes[1].nodes[0].value, 'h2');
    t.equal(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[1].nodes[0].spaces.after, '   ');
});
