import {test} from './util/helpers';

test('comments', '/*test comment*/h2', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '/*test comment*/');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'h2');
});

test('comments (2)', '.a  /*test comment*/label', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'combinator');
    t.deepEqual(tree.nodes[0].nodes[1].value, ' ');
    t.deepEqual(tree.nodes[0].nodes[1].spaces.after, ' ');
    t.deepEqual(tree.nodes[0].nodes[1].rawSpaceAfter, ' /*test comment*/');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'tag');
});

test('comments (3)', '.a  /*test comment*/  label', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'combinator');
    t.deepEqual(tree.nodes[0].nodes[1].value, ' ');
    t.deepEqual(tree.nodes[0].nodes[1].spaces.before, '   ');
    t.deepEqual(tree.nodes[0].nodes[1].rawSpaceBefore, '  /*test comment*/ ');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'tag');
});

test('multiple comments and other things', 'h1/*test*/h2/*test*/.test/*test*/', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag', 'should have a tag');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'comment', 'should have a comment');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'tag', 'should have a tag');
    t.deepEqual(tree.nodes[0].nodes[3].type, 'comment', 'should have a comment');
    t.deepEqual(tree.nodes[0].nodes[4].type, 'class', 'should have a class name');
    t.deepEqual(tree.nodes[0].nodes[5].type, 'comment', 'should have a comment');
});

test('ending in comment', ".bar /* comment 3 */", (t, tree) => {
    let classname = tree.nodes[0].nodes[0];
    t.deepEqual(classname.type, 'class', 'should have a tag');
    t.deepEqual(classname.spaces.after, ' ');
    t.deepEqual(classname.raws.spaces.after, ' /* comment 3 */');
});
