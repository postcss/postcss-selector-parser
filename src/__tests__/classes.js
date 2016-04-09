import {test} from './util/helpers';

test('class name', '.one', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'one');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('multiple class names', '.one.two.three', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'one');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'two');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'three');
});

test('qualified class', 'button.btn-primary', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'class');
});

test('escaped numbers in class name', '.\\31\\ 0', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].value, '\\31\\ 0');
});

test('extraneous non-combinating whitespace', '  .h1   ,  .h2   ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'h2');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.after, '   ');
});
