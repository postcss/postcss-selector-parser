import {test} from './util/helpers';

test('escaped semicolon in class', '.\\;', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ';');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\;');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('escaped semicolon in id', '#\\;', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ';');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\;');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

// This is a side-effect of allowing media queries to be parsed. Not sure it shouldn't just be an error.
test('bare parens capture contents as a string', '(h1)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '(h1)');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'string');
});
