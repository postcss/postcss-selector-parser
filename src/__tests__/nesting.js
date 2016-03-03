import {test} from './util/helpers';

test('nesting selector', '&', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, '&');
    t.same(tree.nodes[0].nodes[0].type, 'nesting');
});

test('nesting selector followed by a class', '& .class', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, '&');
    t.same(tree.nodes[0].nodes[0].type, 'nesting');
    t.same(tree.nodes[0].nodes[1].value, ' ');
    t.same(tree.nodes[0].nodes[1].type, 'combinator');
    t.same(tree.nodes[0].nodes[2].value, 'class');
    t.same(tree.nodes[0].nodes[2].type, 'class');
});

test('&foo', '&foo', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, '&');
    t.same(tree.nodes[0].nodes[0].type, 'nesting');
    t.same(tree.nodes[0].nodes[1].value, 'foo');
    t.same(tree.nodes[0].nodes[1].type, 'tag');
});

test('&-foo', '&-foo', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, '&');
    t.same(tree.nodes[0].nodes[0].type, 'nesting');
    t.same(tree.nodes[0].nodes[1].value, '-foo');
    t.same(tree.nodes[0].nodes[1].type, 'tag');
});

test('&_foo', '&_foo', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, '&');
    t.same(tree.nodes[0].nodes[0].type, 'nesting');
    t.same(tree.nodes[0].nodes[1].value, '_foo');
    t.same(tree.nodes[0].nodes[1].type, 'tag');
});
