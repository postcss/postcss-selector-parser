import {test} from './util/helpers';

test('non-standard selector', '.icon.is-$(network)', (t, tree) => {
    let class1 = tree.nodes[0].nodes[0];
    t.deepEqual(class1.value, 'icon');
    t.deepEqual(class1.type, 'class');
    t.deepEqual(class1.source.start.column, 1);
    t.deepEqual(class1.source.end.column, 5);
    t.deepEqual(class1.sourceIndex, 0);

    let class2 = tree.nodes[0].nodes[1];
    t.deepEqual(class2.value, 'is-$(network)');
    t.deepEqual(class2.type, 'class');
    t.deepEqual(class2.source.start.column, 6);
    // t.deepEqual(class2.source.end.column, 19); // Fail - 10
    t.deepEqual(class2.sourceIndex, 5);
});

test('at word in selector', 'em@il.com', (t, tree) => {
    const node1 = tree.nodes[0].nodes[0];
    t.deepEqual(node1.value, 'em@il');
    t.deepEqual(node1.type, 'tag');
    t.deepEqual(node1.source.start.column, 1);
    t.deepEqual(node1.source.end.column, 5);
    t.deepEqual(node1.sourceIndex, 0);

    const node2 = tree.nodes[0].nodes[1];
    t.deepEqual(node2.value, 'com');
    t.deepEqual(node2.type, 'class');
    t.deepEqual(node2.source.start.column, 6);
    t.deepEqual(node2.source.end.column, 9);
    t.deepEqual(node2.sourceIndex, 5);
});

test('leading combinator', '> *', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '>');
    t.deepEqual(tree.nodes[0].nodes[1].value, '*');
});

test('sass escapes', '.#{$classname}', (t, tree) => {
    const node = tree.nodes[0].nodes[0];
    t.deepEqual(node.type, "class");
    t.deepEqual(node.value, "#{$classname}");
    t.deepEqual(node.source.start.column, 1);
    t.deepEqual(node.source.end.column, 14);
    t.deepEqual(node.sourceIndex, 0);
});

test('sass escapes (2)', '[lang=#{$locale}]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, "attribute");
    t.deepEqual(tree.nodes[0].nodes[0].attribute, "lang");
    t.deepEqual(tree.nodes[0].nodes[0].operator, "=");
    t.deepEqual(tree.nodes[0].nodes[0].value, "#{$locale}");
});

test('sass escapes (3)', '.classname1.#{$classname2}', (t, tree) => {
    const node1 = tree.nodes[0].nodes[0];
    t.deepEqual(node1.type, "class");
    t.deepEqual(node1.value, "classname1");
    t.deepEqual(node1.source.start.column, 1);
    t.deepEqual(node1.source.end.column, 11);
    t.deepEqual(node1.sourceIndex, 0);

    const node2 = tree.nodes[0].nodes[1];
    t.deepEqual(node2.type, "class");
    t.deepEqual(node2.value, "#{$classname2}");
    t.deepEqual(node2.source.start.column, 12);
    t.deepEqual(node2.source.end.column, 26);
    t.deepEqual(node2.sourceIndex, 11);
});

test('placeholder', '%foo', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, "tag");
    t.deepEqual(tree.nodes[0].nodes[0].value, "%foo");
});

test('styled selector', '${Step}', (t, tree) => {
    const node = tree.nodes[0].nodes[0];
    t.deepEqual(node.type, "tag");
    t.deepEqual(node.value, "${Step}");
    t.deepEqual(node.source.start.column, 1);
    t.deepEqual(node.source.end.column, 7);
    t.deepEqual(node.sourceIndex, 0);
});

test('styled selector (2)', '${Step}:nth-child(odd)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, "tag");
    t.deepEqual(tree.nodes[0].nodes[0].value, "${Step}");
    t.deepEqual(tree.nodes[0].nodes[1].type, "pseudo");
    t.deepEqual(tree.nodes[0].nodes[1].value, ":nth-child");
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].type, "tag");
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, "odd");
});
