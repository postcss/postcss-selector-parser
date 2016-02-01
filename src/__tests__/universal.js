import {test} from './util/helpers';

test('universal selector', '*', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, '*');
    t.same(tree.nodes[0].nodes[0].type, 'universal');
});

test('lobotomized owl', '* + *', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].type, 'universal');
    t.same(tree.nodes[0].nodes[1].type, 'combinator');
    t.same(tree.nodes[0].nodes[2].type, 'universal');
});

test('extraneous non-combinating whitespace', '  *   ,  *   ', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, '*');
    t.same(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.same(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.same(tree.nodes[1].nodes[0].value, '*');
    t.same(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.same(tree.nodes[1].nodes[0].spaces.after, '   ');
});

test('qualified universal selector', '*[href] *:not(*.green)', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].value, '*');
    t.same(tree.nodes[0].nodes[3].value, '*');
    t.same(tree.nodes[0].nodes[4].nodes[0].nodes[0].value, '*');
});
