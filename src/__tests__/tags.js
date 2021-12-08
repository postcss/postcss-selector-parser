import {test} from './util/helpers';

test('tag selector', 'h1', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
});

test('multiple tag selectors', 'h1, h2', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'h2');
});

test('extraneous non-combinating whitespace', '  h1   ,  h2   ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'h2');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.after, '   ');
});

test('tag with trailing comma', 'h1,', (t, tree) => {
    t.deepEqual(tree.trailingComma, true);
});

test('tag with trailing slash', 'h1\\', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1\\');
});

test('tag with attribute', 'label[for="email"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'label');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'email');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'for');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'attribute');
    t.deepEqual(tree.nodes[0].nodes[1].quoteMark, '"');
});

test('keyframes animation tag selector', '0.00%', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '0.00%');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
});
