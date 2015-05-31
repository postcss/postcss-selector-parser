'use strict';

import {test} from './util/helpers';

test('column combinator', '.selected||td', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, 'selected');
    t.equal(tree.nodes[0].nodes[0].combinator, '||');
    t.equal(tree.nodes[0].nodes[1].value, 'td');
});

test('column combinator (2)', '.selected || td', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, 'selected');
    t.equal(tree.nodes[0].nodes[0].combinator, ' || ');
    t.equal(tree.nodes[0].nodes[1].value, 'td');
});

test('descendant combinator', 'h1 h2', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].combinator, ' ');
    t.equal(tree.nodes[0].nodes[1].value, 'h2');
});

test('multiple descendant combinators', 'h1 h2 h3 h4', (t, tree) => {
    t.plan(4);
    t.equal(tree.nodes[0].nodes[0].combinator, ' ', 'should have a combinator');
    t.equal(tree.nodes[0].nodes[1].combinator, ' ', 'should have a combinator');
    t.equal(tree.nodes[0].nodes[2].combinator, ' ', 'should have a combinator');
    t.notOk(tree.nodes[0].nodes[3].combinator, 'should not have a combinator on the last node');
});

test('adjacent sibling combinator', 'h1~h2', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].combinator, '~');
    t.equal(tree.nodes[0].nodes[1].value, 'h2');
});

test('adjacent sibling combinator (2)', 'h1 ~h2', (t, tree) => {
    t.plan(4);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].combinator, ' ~');
    t.equal(tree.nodes[0].nodes[1].value, 'h2');
    t.notOk(tree.nodes[0].nodes[1].combinator);
});

test('adjacent sibling combinator (3)', 'h1~ h2', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].combinator, '~ ');
    t.equal(tree.nodes[0].nodes[1].value, 'h2');
});

test('adjacent sibling combinator (4)', 'h1 ~ h2', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].combinator, ' ~ ');
    t.equal(tree.nodes[0].nodes[1].value, 'h2');
});

test('adjacent sibling combinator (5)', 'h1~h2~h3', (t, tree) => {
    t.plan(5);
    t.equal(tree.nodes[0].nodes[0].value, 'h1');
    t.equal(tree.nodes[0].nodes[0].combinator, '~');
    t.equal(tree.nodes[0].nodes[1].value, 'h2');
    t.equal(tree.nodes[0].nodes[1].combinator, '~');
    t.equal(tree.nodes[0].nodes[2].value, 'h3');
});

test('multiple combinators', 'h1~h2>h3', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].combinator, '~', 'should have a combinator');
    t.equal(tree.nodes[0].nodes[1].combinator, '>', 'should have a combinator');
    t.notOk(tree.nodes[0].nodes[2].combinator, 'should not have a combinator on the last node');
});

test('multiple combinators with whitespaces', 'h1 + h2 > h3', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].combinator, ' + ', 'should have a combinator');
    t.equal(tree.nodes[0].nodes[1].combinator, ' > ', 'should have a combinator');
    t.notOk(tree.nodes[0].nodes[2].combinator, 'should not have a combinator on the last node');
});

test('multiple combinators with whitespaces', 'h1+ h2 >h3', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].combinator, '+ ', 'should have a combinator');
    t.equal(tree.nodes[0].nodes[1].combinator, ' >', 'should have a combinator');
    t.notOk(tree.nodes[0].nodes[2].combinator, 'should not have a combinator on the last node');
});
