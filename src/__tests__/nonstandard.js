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

test('sass escapes', '.#{$classname}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, "class");
    t.deepEqual(tree.nodes[0].nodes[0].value, "#{$classname}");
});

test('sass escapes (2)', '[lang=#{$locale}]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, "attribute");
    t.deepEqual(tree.nodes[0].nodes[0].attribute, "lang");
    t.deepEqual(tree.nodes[0].nodes[0].operator, "=");
    t.deepEqual(tree.nodes[0].nodes[0].value, "#{$locale}");
});

test('placeholder', '%foo', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, "tag");
    t.deepEqual(tree.nodes[0].nodes[0].value, "%foo");
});

test('styled selector', '${Step}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, "tag");
    t.deepEqual(tree.nodes[0].nodes[0].value, "${Step}");
});

test('styled selector (2)', '${Step}:nth-child(odd)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, "tag");
    t.deepEqual(tree.nodes[0].nodes[0].value, "${Step}");
    t.deepEqual(tree.nodes[0].nodes[1].type, "pseudo");
    t.deepEqual(tree.nodes[0].nodes[1].value, ":nth-child");
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].type, "tag");
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, "odd");
});
