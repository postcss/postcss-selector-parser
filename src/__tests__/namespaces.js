import {test} from './util/helpers';

test('match tags in the postcss namespace', 'postcss|button', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'button');
});

test('match everything in the postcss namespace', 'postcss|*', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
});

test('match any namespace', '*|button', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, '*');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'button');
});

test('match all elements within the postcss namespace', 'postcss|*', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
});

test('match all elements in all namespaces', '*|*', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, '*');
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
});

test('match all elements without a namespace', '|*', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
});

test('match tags with no namespace', '|button', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
    t.deepEqual(tree.nodes[0].nodes[0].value, 'button');
});

test('match namespace inside attribute selector', '[postcss|href=test]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'test');
});

test('match namespace inside attribute selector (2)', '[postcss|href]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, 'postcss');
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
});

test('match namespace inside attribute selector (3)', '[*|href]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, '*');
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
});

test('match default namespace inside attribute selector', '[|href]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
});

test('match default namespace inside attribute selector with spaces', '[ |href ]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
});

test('namespace with qualified id selector', 'ns|h1#foo', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, 'ns');
});

test('namespace with qualified class selector', 'ns|h1.foo', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, 'ns');
});

test('ns alias for namespace', 'f\\oo|h1.foo', (t, tree) => {
    let tag = tree.nodes[0].nodes[0];
    t.deepEqual(tag.namespace, 'foo');
    t.deepEqual(tag.ns, 'foo');
    tag.ns = "bar";
    t.deepEqual(tag.namespace, 'bar');
    t.deepEqual(tag.ns, 'bar');
});
