import {test} from './util/helpers';

test('id selector', '#one', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'one');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id hack', '#one#two', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'id');
});

test('id and class names mixed', '#one.two.three', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'one');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'two');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'three');

    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'class');
});

test('qualified id', 'button#one', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'id');
});

test('qualified id & class name', 'h1#one.two', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'class');
});

test('extraneous non-combinating whitespace', '  #h1   ,  #h2   ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'h2');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.after, '   ');
});

test('Sass interpolation within a class', '.#{foo}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes.length, 1);
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].value, '#{foo}');
});

test('Sass interpolation within an id', '#foo#{bar}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes.length, 1);
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo#{bar}');
});

test('Less interpolation within an id', '#foo@{bar}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes.length, 1);
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo@{bar}');
});
