import {test} from './util/helpers';

test('multiple combinating spaces', 'h1         h2', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[1].value, '         ');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h2');
});

test('column combinator', '.selected||td', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'selected');
    t.deepEqual(tree.nodes[0].nodes[1].value, '||');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'td');
});

test('column combinator (2)', '.selected || td', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'selected');
    t.deepEqual(tree.nodes[0].nodes[1].spaces.before, ' ');
    t.deepEqual(tree.nodes[0].nodes[1].value, '||');
    t.deepEqual(tree.nodes[0].nodes[1].spaces.after, ' ');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'td');
});

test('descendant combinator', 'h1 h2', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[1].value, ' ');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h2');
});

test('multiple descendant combinators', 'h1 h2 h3 h4', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].value, ' ', 'should have a combinator');
    t.deepEqual(tree.nodes[0].nodes[3].value, ' ', 'should have a combinator');
    t.deepEqual(tree.nodes[0].nodes[5].value, ' ', 'should have a combinator');
});

test('adjacent sibling combinator', 'h1~h2', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[1].value, '~');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h2');
});

test('adjacent sibling combinator (2)', 'h1 ~h2', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[1].spaces.before, ' ');
    t.deepEqual(tree.nodes[0].nodes[1].value, '~');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h2');
});

test('adjacent sibling combinator (3)', 'h1~ h2', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[1].value, '~');
    t.deepEqual(tree.nodes[0].nodes[1].spaces.after, ' ');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h2');
});

test('adjacent sibling combinator (4)', 'h1 ~ h2', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[1].spaces.before, ' ');
    t.deepEqual(tree.nodes[0].nodes[1].value, '~');
    t.deepEqual(tree.nodes[0].nodes[1].spaces.after, ' ');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h2');
});

test('adjacent sibling combinator (5)', 'h1~h2~h3', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[1].value, '~');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h2');
    t.deepEqual(tree.nodes[0].nodes[3].value, '~');
    t.deepEqual(tree.nodes[0].nodes[4].value, 'h3');
});

test('multiple combinators', 'h1~h2>h3', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].value, '~', 'should have a combinator');
    t.deepEqual(tree.nodes[0].nodes[3].value, '>', 'should have a combinator');
});

test('multiple combinators with whitespaces', 'h1 + h2 > h3', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].value, '+', 'should have a combinator');
    t.deepEqual(tree.nodes[0].nodes[3].value, '>', 'should have a combinator');
});

test('multiple combinators with whitespaces', 'h1+ h2 >h3', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].value, '+', 'should have a combinator');
    t.deepEqual(tree.nodes[0].nodes[3].value, '>', 'should have a combinator');
});

test('trailing combinator & spaces', 'p +        ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'p', 'should be a paragraph');
    t.deepEqual(tree.nodes[0].nodes[1].value, '+', 'should have a combinator');
});
test('ending in comment has no trailing combinator', ".bar /* comment 3 */", (t, tree) => {
    let nodeTypes = tree.nodes[0].map(n => n.type);
    t.deepEqual(nodeTypes, ["class"]);
});
test('with spaces and a comment has only one combinator', ".bar /* comment 3 */ > .foo", (t, tree) => {
    let nodeTypes = tree.nodes[0].map(n => n.type);
    t.deepEqual(nodeTypes, ["class", "combinator", "class"]);
});

test('with a meaningful comment in the middle of a compound selector', "div/* wtf */.foo", (t, tree) => {
    let nodeTypes = tree.nodes[0].map(n => n.type);
    t.deepEqual(nodeTypes, ["tag", "comment", "class"]);
});

test('with a comment in the middle of a descendant selector', "div/* wtf */ .foo", (t, tree) => {
    let nodeTypes = tree.nodes[0].map(n => n.type);
    t.deepEqual(nodeTypes, ["tag", "comment", "combinator", "class"]);
});
