import {test} from './util/helpers';

test('escaped semicolon', '.\\;', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '\\;');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('escaped semicolon', '#\\;', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '\\;');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});
