'use strict';

import {test} from './util/helpers';

test('tag selector', 'h1', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].value, 'h1');
    t.equal(tree.selectors[0].rules[0].type, 'tag');
});

test('multiple tag selectors', 'h1, h2', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].value, 'h1');
    t.equal(tree.selectors[1].rules[0].value, 'h2');
});

