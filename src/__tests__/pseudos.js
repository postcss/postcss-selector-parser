'use strict';

import {test} from './util/helpers';

test('pseudo element (single colon)', 'h1:after', (t, tree) => {
    t.plan(3);
    t.equal(tree.selectors[0].rules[0].type, 'tag');
    t.equal(tree.selectors[0].rules[1].type, 'pseudo');
    t.equal(tree.selectors[0].rules[1].value, ':after');
});

test('pseudo element (double colon)', 'h1::after', (t, tree) => {
    t.plan(3);
    t.equal(tree.selectors[0].rules[0].type, 'tag');
    t.equal(tree.selectors[0].rules[1].type, 'pseudo');
    t.equal(tree.selectors[0].rules[1].value, '::after');
});

test('multiple pseudo elements', '*:target::before, a:after', (t, tree) => {
    t.plan(4);
    t.equal(tree.selectors[0].rules[0].value, '*');
    t.equal(tree.selectors[0].rules[1].value, ':target');
    t.equal(tree.selectors[0].rules[2].value, '::before');
    t.equal(tree.selectors[1].rules[1].value, ':after');
});

test('negation pseudo element', 'h1:not(.heading)', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[1].value, ':not');
    t.equal(tree.selectors[0].rules[1].parameters.selectors[0].value, 'heading');
});
