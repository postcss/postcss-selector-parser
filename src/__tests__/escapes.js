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
