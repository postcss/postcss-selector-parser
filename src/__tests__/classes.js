import {test} from './util/helpers';

test('class name', '.one', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'one');
    t.same(tree.nodes[0].nodes[0].type, 'class');
});

test('multiple class names', '.one.two.three', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'one');
    t.same(tree.nodes[0].nodes[1].value, 'two');
    t.same(tree.nodes[0].nodes[2].value, 'three');
});

test('qualified class', 'button.btn-primary', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].type, 'tag');
    t.same(tree.nodes[0].nodes[1].type, 'class');
});

test('escaped numbers in class name', '.\\31\\ 0', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].type, 'class');
    t.same(tree.nodes[0].nodes[0].value, '\\31\\ 0');
});

test('extraneous non-combinating whitespace', '  .h1   ,  .h2   ', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'h1');
    t.same(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.same(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.same(tree.nodes[1].nodes[0].value, 'h2');
    t.same(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.same(tree.nodes[1].nodes[0].spaces.after, '   ');
});
