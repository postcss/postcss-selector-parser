'use strict';

import {test} from './util/helpers';

test('class name', '.one', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].value, 'one');
    t.equal(tree.selectors[0].rules[0].type, 'class');
});

test('multiple class names', '.one.two.three', (t, tree) => {
    t.plan(3);
    t.equal(tree.selectors[0].rules[0].value, 'one');
    t.equal(tree.selectors[0].rules[1].value, 'two');
    t.equal(tree.selectors[0].rules[2].value, 'three');
});

test('qualified class', 'button.btn-primary', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].type, 'tag');
    t.equal(tree.selectors[0].rules[1].type, 'class');
});

test('escaped numbers in class name', '.\\31\\ 0', (t, tree, d) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].type, 'class');
    t.equal(tree.selectors[0].rules[0].value, '\\31\\ 0');
});
