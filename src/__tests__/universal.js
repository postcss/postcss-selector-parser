'use strict';

import {test} from './util/helpers';

test('universal selector', '*', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].value, '*');
    t.equal(tree.nodes[0].nodes[0].type, 'universal');
});

test('lobotomized owl', '* + *', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].type, 'universal');
    t.equal(tree.nodes[0].nodes[1].type, 'combinator');
    t.equal(tree.nodes[0].nodes[2].type, 'universal');
});

test('extraneous non-combinating whitespace', '  *   ,  *   ', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[0].value, '*');
    t.equal(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.equal(tree.nodes[1].nodes[0].value, '*');
    t.equal(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.equal(tree.nodes[1].nodes[0].spaces.after, '   ');
});

test('qualified universal selector', '*[href] *:not(*.green)', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, '*');
    t.equal(tree.nodes[0].nodes[3].value, '*');
    t.equal(tree.nodes[0].nodes[4].nodes[0].nodes[0].value, '*');
});
