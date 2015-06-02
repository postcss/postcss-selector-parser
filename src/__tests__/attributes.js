'use strict';

import {test} from './util/helpers';

test('attribute selector', '[href]', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].attribute, 'href');
    t.equal(tree.nodes[0].nodes[0].type, 'attribute');
});

test('multiple attribute selectors', '[href][class][name]', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].attribute, 'href');
    t.equal(tree.nodes[0].nodes[1].attribute, 'class');
    t.equal(tree.nodes[0].nodes[2].attribute, 'name');
});

test('attribute selector with a value', '[name=james]', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].attribute, 'name');
    t.equal(tree.nodes[0].nodes[0].operator, '=');
    t.equal(tree.nodes[0].nodes[0].value, 'james');
});

test('attribute selector with quoted value', '[name="james"]', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].attribute, 'name');
    t.equal(tree.nodes[0].nodes[0].operator, '=');
    t.equal(tree.nodes[0].nodes[0].value, '"james"');
});

test('multiple attribute selectors + combinator', '[href][class][name] h1 > h2', (t, tree) => {
    t.plan(4);
    t.equal(tree.nodes[0].nodes[2].attribute, 'name');
    t.equal(tree.nodes[0].nodes[3].value, ' ');
    t.equal(tree.nodes[0].nodes[5].value, '>');
    t.equal(tree.nodes[0].nodes[6].value, 'h2');
});

test('attribute, class, combinator', '[href] > h2.test', (t, tree) => {
    t.plan(4);
    t.equal(tree.nodes[0].nodes[0].attribute, 'href');
    t.equal(tree.nodes[0].nodes[1].value, '>');
    t.equal(tree.nodes[0].nodes[2].value, 'h2');
    t.equal(tree.nodes[0].nodes[3].value, 'test');
});

test('attribute selector with quoted value & combinator', '[name="james"] > h1', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[0].value, '"james"');
    t.equal(tree.nodes[0].nodes[1].value, '>');
    t.equal(tree.nodes[0].nodes[2].value, 'h1');
});

test('multiple quoted attribute selectors', '[href*="test.com"][rel="external"][id][class~="test"] > [name]', (t, tree) => {
    t.plan(11);
    t.equal(tree.nodes[0].nodes[0].attribute, 'href');
    t.equal(tree.nodes[0].nodes[0].value, '"test.com"');
    t.equal(tree.nodes[0].nodes[1].attribute, 'rel');
    t.equal(tree.nodes[0].nodes[1].value, '"external"');
    t.equal(tree.nodes[0].nodes[2].attribute, 'id');
    t.notOk(tree.nodes[0].nodes[2].value, 'should not have a value');
    t.equal(tree.nodes[0].nodes[3].attribute, 'class');
    t.equal(tree.nodes[0].nodes[3].value, '"test"');
    t.equal(tree.nodes[0].nodes[4].value, '>');
    t.equal(tree.nodes[0].nodes[5].attribute, 'name');
    t.notOk(tree.nodes[0].nodes[5].value, 'should not have a value');
});

test('more attribute operators','[href*=test],[href^=test],[href$=test],[href|=test]', (t, tree) => {
    t.plan(4);
    t.equal(tree.nodes[0].nodes[0].operator, '*=');
    t.equal(tree.nodes[1].nodes[0].operator, '^=');
    t.equal(tree.nodes[2].nodes[0].operator, '$=');
    t.equal(tree.nodes[3].nodes[0].operator, '|=');
});

test('spaces in attribute selectors', 'h1[  href  *=  "test"  ]', (t, tree) => {
    t.plan(3);
    t.equal(tree.nodes[0].nodes[1].attribute, '  href  ');
    t.equal(tree.nodes[0].nodes[1].operator, '*=');
    t.equal(tree.nodes[0].nodes[1].value, '  "test"  ');
});

test('insensitive attribute selector 1', '[href="test" i]', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].value, '"test"');
    t.equal(tree.nodes[0].nodes[0].insensitive, true);
});

test('insensitive attribute selector 2', '[href=TEsT i  ]', (t, tree) => {
    t.plan(2);
    t.equal(tree.nodes[0].nodes[0].value, 'TEsT');
    t.equal(tree.nodes[0].nodes[0].raw.insensitive, ' i  ');
});
