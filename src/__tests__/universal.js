'use strict';

import {test} from './util/helpers';

test('universal selector', '*', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].value, '*');
    t.equal(tree.selectors[0].rules[0].type, 'universal');
});

test('lobotomized owl', '* + *', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].type, 'universal');
    t.equal(tree.selectors[0].rules[0].rules[0].type, 'universal');
});
