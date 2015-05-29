'use strict';

import {test} from './util/helpers';

test('id selector', '#one', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].value, 'one');
    t.equal(tree.selectors[0].rules[0].type, 'id');
});

test('id and class names mixed', '#one.two.three', (t, tree) => {
    t.plan(6);
    t.equal(tree.selectors[0].rules[0].value, 'one');
    t.equal(tree.selectors[0].rules[1].value, 'two');
    t.equal(tree.selectors[0].rules[2].value, 'three');

    t.equal(tree.selectors[0].rules[0].type, 'id');
    t.equal(tree.selectors[0].rules[1].type, 'class');
    t.equal(tree.selectors[0].rules[2].type, 'class');
});

test('qualified id', 'button#one', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].type, 'tag');
    t.equal(tree.selectors[0].rules[1].type, 'id');
});

test('qualified id & class name', 'h1#one.two', (t, tree) => {
    t.plan(3);
    t.equal(tree.selectors[0].rules[0].type, 'tag');
    t.equal(tree.selectors[0].rules[1].type, 'id');
    t.equal(tree.selectors[0].rules[2].type, 'class');
});
