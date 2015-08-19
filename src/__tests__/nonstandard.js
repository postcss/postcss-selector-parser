'use strict';

import {test} from './util/helpers';

test('non-standard selector', '.icon.is-$(network)', (t, tree) => {
    t.plan(4);
    t.equal(tree.nodes[0].nodes[0].value, 'icon');
    t.equal(tree.nodes[0].nodes[0].type, 'class');
    t.equal(tree.nodes[0].nodes[1].value, 'is-$(network)');
    t.equal(tree.nodes[0].nodes[1].type, 'class');
});

test('at word in selector', 'em@il.com', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, 'em');
    t.equal(tree.nodes[0].nodes[1].value, '@il');
    t.equal(tree.nodes[0].nodes[2].value, 'com');
});

test('leading combinator', '> *', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].value, '>');
    t.equal(tree.nodes[0].nodes[1].value, '*');
});
