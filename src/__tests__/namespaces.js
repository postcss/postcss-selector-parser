import {test} from './util/helpers';

test('match tags in the postcss namespace', 'postcss|button', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.same(tree.nodes[0].nodes[0].value, 'button');
});

test('match everything in the postcss namespace', 'postcss|*', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.same(tree.nodes[0].nodes[0].value, '*');
});

test('match any namespace', '*|button', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, '*');
    t.same(tree.nodes[0].nodes[0].value, 'button');
});

test('match all elements within the postcss namespace', 'postcss|*', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.same(tree.nodes[0].nodes[0].value, '*');
});

test('match all elements in all namespaces', '*|*', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, '*');
    t.same(tree.nodes[0].nodes[0].value, '*');
});

test('match all elements without a namespace', '|*', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, true);
    t.same(tree.nodes[0].nodes[0].value, '*');
});

test('match tags with no namespace', '|button', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, true);
    t.same(tree.nodes[0].nodes[0].value, 'button');
});

test('match namespace inside attribute selector', '[postcss|href=test]', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.same(tree.nodes[0].nodes[0].value, 'test');
});

test('match namespace inside attribute selector (2)', '[postcss|href]', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.same(tree.nodes[0].nodes[0].attribute, 'href');
});

test('match namespace inside attribute selector (3)', '[*|href]', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, '*');
    t.same(tree.nodes[0].nodes[0].attribute, 'href');
});

test('match namespace inside attribute selector (4)', '[|href]', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].namespace, true);
    t.same(tree.nodes[0].nodes[0].attribute, 'href');
});
