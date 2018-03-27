import {test} from './util/helpers';

test('nesting selector', '&', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '&');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'nesting');
});

test('nesting selector followed by a class', '& .class', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '&');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'nesting');
    t.deepEqual(tree.nodes[0].nodes[1].value, ' ');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'combinator');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'class');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'class');
});

test('&foo', '&foo', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '&');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'nesting');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'foo');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'tag');
});

test('&-foo', '&-foo', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '&');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'nesting');
    t.deepEqual(tree.nodes[0].nodes[1].value, '-foo');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'tag');
});

test('&_foo', '&_foo', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '&');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'nesting');
    t.deepEqual(tree.nodes[0].nodes[1].value, '_foo');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'tag');
});

test('&|foo', '&|foo', (t, tree) => {
    let element = tree.nodes[0].nodes[0];
    t.deepEqual(element.value, 'foo');
    t.deepEqual(element.type, 'tag');
    t.deepEqual(element.namespace, '&');
});
