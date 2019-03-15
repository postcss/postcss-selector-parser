import {test} from './util/helpers';

test('universal selector', '*', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'universal');
});

test('lobotomized owl', '* + *', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'universal');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'combinator');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'universal');
});

test('universal selector with descendant combinator', '* *', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'universal');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'combinator');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'universal');
});

test('universal selector with descendant combinator and extraneous non-combinating whitespace', '*         *', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'universal');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'combinator');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'universal');
});

test('extraneous non-combinating whitespace', '  *   ,  *   ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.deepEqual(tree.nodes[1].nodes[0].value, '*');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.after, '   ');
});

test('qualified universal selector', '*[href] *:not(*.green)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
    t.deepEqual(tree.nodes[0].nodes[3].value, '*');
    t.deepEqual(tree.nodes[0].nodes[4].nodes[0].nodes[0].value, '*');
});

test('universal selector with pseudo', '*::--webkit-media-controls-play-button', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'universal');
    t.deepEqual(tree.nodes[0].nodes[1].value, '::--webkit-media-controls-play-button');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'pseudo');
});
