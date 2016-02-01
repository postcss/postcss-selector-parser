import {test} from './util/helpers';

test('multiple combinating spaces', 'h1         h2', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'h1');
    t.same(tree.nodes[0].nodes[1].value, '         ');
    t.same(tree.nodes[0].nodes[2].value, 'h2');
});

test('column combinator', '.selected||td', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'selected');
    t.same(tree.nodes[0].nodes[1].value, '||');
    t.same(tree.nodes[0].nodes[2].value, 'td');
});

test('column combinator (2)', '.selected || td', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'selected');
    t.same(tree.nodes[0].nodes[1].spaces.before, ' ');
    t.same(tree.nodes[0].nodes[1].value, '||');
    t.same(tree.nodes[0].nodes[1].spaces.after, ' ');
    t.same(tree.nodes[0].nodes[2].value, 'td');
});

test('descendant combinator', 'h1 h2', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'h1');
    t.same(tree.nodes[0].nodes[1].value, ' ');
    t.same(tree.nodes[0].nodes[2].value, 'h2');
});

test('multiple descendant combinators', 'h1 h2 h3 h4', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].value, ' ', 'should have a combinator');
    t.same(tree.nodes[0].nodes[3].value, ' ', 'should have a combinator');
    t.same(tree.nodes[0].nodes[5].value, ' ', 'should have a combinator');
});

test('adjacent sibling combinator', 'h1~h2', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'h1');
    t.same(tree.nodes[0].nodes[1].value, '~');
    t.same(tree.nodes[0].nodes[2].value, 'h2');
});

test('adjacent sibling combinator (2)', 'h1 ~h2', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'h1');
    t.same(tree.nodes[0].nodes[1].spaces.before, ' ');
    t.same(tree.nodes[0].nodes[1].value, '~');
    t.same(tree.nodes[0].nodes[2].value, 'h2');
});

test('adjacent sibling combinator (3)', 'h1~ h2', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'h1');
    t.same(tree.nodes[0].nodes[1].value, '~');
    t.same(tree.nodes[0].nodes[1].spaces.after, ' ');
    t.same(tree.nodes[0].nodes[2].value, 'h2');
});

test('adjacent sibling combinator (4)', 'h1 ~ h2', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'h1');
    t.same(tree.nodes[0].nodes[1].spaces.before, ' ');
    t.same(tree.nodes[0].nodes[1].value, '~');
    t.same(tree.nodes[0].nodes[1].spaces.after, ' ');
    t.same(tree.nodes[0].nodes[2].value, 'h2');
});

test('adjacent sibling combinator (5)', 'h1~h2~h3', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'h1');
    t.same(tree.nodes[0].nodes[1].value, '~');
    t.same(tree.nodes[0].nodes[2].value, 'h2');
    t.same(tree.nodes[0].nodes[3].value, '~');
    t.same(tree.nodes[0].nodes[4].value, 'h3');
});

test('multiple combinators', 'h1~h2>h3', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].value, '~', 'should have a combinator');
    t.same(tree.nodes[0].nodes[3].value, '>', 'should have a combinator');
});

test('multiple combinators with whitespaces', 'h1 + h2 > h3', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].value, '+', 'should have a combinator');
    t.same(tree.nodes[0].nodes[3].value, '>', 'should have a combinator');
});

test('multiple combinators with whitespaces', 'h1+ h2 >h3', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].value, '+', 'should have a combinator');
    t.same(tree.nodes[0].nodes[3].value, '>', 'should have a combinator');
});

test('trailing combinator & spaces', 'p +        ', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, 'p', 'should be a paragraph');
    t.same(tree.nodes[0].nodes[1].value, '+', 'should have a combinator');
});
