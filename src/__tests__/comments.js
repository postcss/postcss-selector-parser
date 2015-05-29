'use strict';

import {test} from './util/helpers';

test('comments', '/*test comment*/h2', (t, tree) => {
    t.plan(2);
    t.equal(tree.selectors[0].rules[0].value, '/*test comment*/');
    t.equal(tree.selectors[0].rules[1].value, 'h2');
});

test('multiple comments and other things', 'h1/*test*/h2/*test*/.test/*test*/', (t, tree) => {
    t.plan(6);
    t.equal(tree.selectors[0].rules[0].type, 'tag', 'should have a tag');
    t.equal(tree.selectors[0].rules[1].type, 'comment', 'should have a comment');
    t.equal(tree.selectors[0].rules[2].type, 'tag', 'should have a tag');
    t.equal(tree.selectors[0].rules[3].type, 'comment', 'should have a comment');
    t.equal(tree.selectors[0].rules[4].type, 'class', 'should have a class name');
    t.equal(tree.selectors[0].rules[5].type, 'comment', 'should have a comment');
});
