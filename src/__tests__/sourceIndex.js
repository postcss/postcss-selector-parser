'use strict';

import {test} from './util/helpers';


var inspect = function (what) {
    return require('util').inspect(what, false, null);
};

test('universal selector', '*', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].source.start.column, 1);
    t.equal(tree.nodes[0].nodes[0].source.end.column, 1);
    t.equal(tree.nodes[0].nodes[0].sourceIndex, 0);
});

test('lobotomized owl selector', '* + *', (t, tree) => {
    t.plan(9);
    t.equal(tree.nodes[0].nodes[0].source.start.column, 1);
    t.equal(tree.nodes[0].nodes[0].source.end.column, 1);
    t.equal(tree.nodes[0].nodes[0].sourceIndex, 0);
    t.equal(tree.nodes[0].nodes[1].source.start.column, 2);
    t.equal(tree.nodes[0].nodes[1].source.end.column, 4);
    t.equal(tree.nodes[0].nodes[1].sourceIndex, 1);
    t.equal(tree.nodes[0].nodes[2].source.start.column, 5);
    t.equal(tree.nodes[0].nodes[2].source.end.column, 5);
    t.equal(tree.nodes[0].nodes[2].sourceIndex, 4);
});

test('comment', '/**\n * Hello!\n */', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].source.start.column, 1);
    t.equal(tree.nodes[0].nodes[0].source.end.column, 3);
    t.equal(tree.nodes[0].nodes[0].sourceIndex, 0);
});

test('comment & universal selectors', '*/*test*/*', (t, tree) => {
    t.plan(9);
    t.equal(tree.nodes[0].nodes[0].source.start.column, 1);
    t.equal(tree.nodes[0].nodes[0].source.end.column, 1);
    t.equal(tree.nodes[0].nodes[0].sourceIndex, 0);
    t.equal(tree.nodes[0].nodes[1].source.start.column, 2);
    t.equal(tree.nodes[0].nodes[1].source.end.column, 9);
    t.equal(tree.nodes[0].nodes[1].sourceIndex, 1);
    t.equal(tree.nodes[0].nodes[2].source.start.column, 10);
    t.equal(tree.nodes[0].nodes[2].source.end.column, 10);
    t.equal(tree.nodes[0].nodes[2].sourceIndex, 9);
});

test('tag selector', 'h1', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].source.start.column, 1);
    t.equal(tree.nodes[0].nodes[0].source.end.column, 2);
    t.equal(tree.nodes[0].nodes[0].sourceIndex, 0);
});

test('id selector', '#id', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].source.start.column, 1);
    t.equal(tree.nodes[0].nodes[0].source.end.column, 3);
    t.equal(tree.nodes[0].nodes[0].sourceIndex, 0);
});

test('tag selector followed by id selector', 'h1, #id', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[0].source.start.column, 1);
    t.equal(tree.nodes[0].nodes[0].source.end.column, 2);
    t.equal(tree.nodes[0].nodes[0].sourceIndex, 0);
    t.equal(tree.nodes[1].nodes[0].source.start.column, 5);
    t.equal(tree.nodes[1].nodes[0].source.end.column, 7);
    t.equal(tree.nodes[1].nodes[0].sourceIndex, 4);
});

test('multiple id selectors', '#one#two', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[0].source.start.column, 1);
    t.equal(tree.nodes[0].nodes[0].source.end.column, 4);
    t.equal(tree.nodes[0].nodes[0].sourceIndex, 0);
    t.equal(tree.nodes[0].nodes[1].source.start.column, 5);
    t.equal(tree.nodes[0].nodes[1].source.end.column, 8);
    t.equal(tree.nodes[0].nodes[1].sourceIndex, 4);
});

test('multiple id selectors (2)', '#one#two#three#four', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[2].source.start.column, 9);
    t.equal(tree.nodes[0].nodes[2].source.end.column, 14);
    t.equal(tree.nodes[0].nodes[2].sourceIndex, 8);
    t.equal(tree.nodes[0].nodes[3].source.start.column, 15);
    t.equal(tree.nodes[0].nodes[3].source.end.column, 19);
    t.equal(tree.nodes[0].nodes[3].sourceIndex, 14);
});

test('multiple id selectors (3)', '#one#two,#three#four', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[1].source.start.column, 5);
    t.equal(tree.nodes[0].nodes[1].source.end.column, 8);
    t.equal(tree.nodes[0].nodes[1].sourceIndex, 4);
    t.equal(tree.nodes[1].nodes[1].source.start.column, 16);
    t.equal(tree.nodes[1].nodes[1].source.end.column, 20);
    t.equal(tree.nodes[1].nodes[1].sourceIndex, 15);
});

test('multiple class selectors', '.one.two,.three.four', (t, tree) => {
    t.plan(6);
    t.equal(tree.nodes[0].nodes[1].source.start.column, 5);
    t.equal(tree.nodes[0].nodes[1].source.end.column, 8);
    t.equal(tree.nodes[0].nodes[1].sourceIndex, 4);
    t.equal(tree.nodes[1].nodes[1].source.start.column, 16);
    t.equal(tree.nodes[1].nodes[1].source.end.column, 20);
    t.equal(tree.nodes[1].nodes[1].sourceIndex, 15);
});
