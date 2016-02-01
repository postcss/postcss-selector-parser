import {test} from './util/helpers';

test('non-standard selector', '.icon.is-$(network)', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'icon');
    t.same(tree.nodes[0].nodes[0].type, 'class');
    t.same(tree.nodes[0].nodes[1].value, 'is-$(network)');
    t.same(tree.nodes[0].nodes[1].type, 'class');
});

test('at word in selector', 'em@il.com', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'em');
    t.same(tree.nodes[0].nodes[1].value, '@il');
    t.same(tree.nodes[0].nodes[2].value, 'com');
});

test('leading combinator', '> *', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, '>');
    t.same(tree.nodes[0].nodes[1].value, '*');
});
