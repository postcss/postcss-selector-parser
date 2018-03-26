import {test} from './util/helpers';

test('non-standard selector', '.icon.is-$(network)', (t, tree) => {
    let class1 = tree.nodes[0].nodes[0];
    t.deepEqual(class1.value, 'icon');
    t.deepEqual(class1.type, 'class');
    let class2 = tree.nodes[0].nodes[1];
    t.deepEqual(class2.value, 'is-$(network)');
    t.deepEqual(class2.type, 'class');
});

test('at word in selector', 'em@il.com', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'em@il');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'com');
});

test('leading combinator', '> *', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '>');
    t.deepEqual(tree.nodes[0].nodes[1].value, '*');
});
