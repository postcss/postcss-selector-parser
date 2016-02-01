import {test} from './util/helpers';

test('id selector', '#one', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'one');
    t.same(tree.nodes[0].nodes[0].type, 'id');
});

test('id hack', '#one#two', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].type, 'id');
    t.same(tree.nodes[0].nodes[1].type, 'id');
});

test('id and class names mixed', '#one.two.three', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'one');
    t.same(tree.nodes[0].nodes[1].value, 'two');
    t.same(tree.nodes[0].nodes[2].value, 'three');

    t.same(tree.nodes[0].nodes[0].type, 'id');
    t.same(tree.nodes[0].nodes[1].type, 'class');
    t.same(tree.nodes[0].nodes[2].type, 'class');
});

test('qualified id', 'button#one', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].type, 'tag');
    t.same(tree.nodes[0].nodes[1].type, 'id');
});

test('qualified id & class name', 'h1#one.two', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].type, 'tag');
    t.same(tree.nodes[0].nodes[1].type, 'id');
    t.same(tree.nodes[0].nodes[2].type, 'class');
});

test('extraneous non-combinating whitespace', '  #h1   ,  #h2   ', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'h1');
    t.same(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.same(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.same(tree.nodes[1].nodes[0].value, 'h2');
    t.same(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.same(tree.nodes[1].nodes[0].spaces.after, '   ');
});
