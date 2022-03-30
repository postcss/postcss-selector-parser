import parser from '../';
import {test} from './util/helpers';

const node = (tree, n = 0) => tree.nodes[0].nodes[n];

test('attribute guard', '[foo]', (t, tree) => {
    let n = node(tree);
    t.true(parser.isNode(n));
    t.false(parser.isAttribute(undefined));
    t.true(parser.isAttribute(n));
    t.false(parser.isContainer(n));
    t.true(parser.isNamespace(n));
});

test('className guard', '.foo', (t, tree) => {
    let n = node(tree);
    t.true(parser.isNode(n));
    t.false(parser.isClassName(undefined));
    t.true(parser.isClassName(n));
    t.false(parser.isContainer(n));
    t.false(parser.isNamespace(n));
});

test('combinator guard', '.foo > .bar', (t, tree) => {
    let n = node(tree, 1);
    t.true(parser.isNode(n));
    t.false(parser.isCombinator(undefined));
    t.true(parser.isCombinator(n));
    t.false(parser.isContainer(n));
    t.false(parser.isNamespace(n));
});

test('comment guard', '/* foo */.foo > .bar', (t, tree) => {
    let n = node(tree);
    t.true(parser.isNode(n));
    t.false(parser.isComment(undefined));
    t.true(parser.isComment(n));
    t.false(parser.isContainer(n));
    t.false(parser.isNamespace(n));
});

test('id guard', '#ident', (t, tree) => {
    let n = node(tree);
    t.true(parser.isNode(n));
    t.false(parser.isIdentifier(undefined));
    t.true(parser.isIdentifier(n));
    t.false(parser.isContainer(n));
    t.false(parser.isNamespace(n));
});

test('nesting guard', '&.foo', (t, tree) => {
    let n = node(tree);
    t.true(parser.isNode(n));
    t.false(parser.isNesting(undefined));
    t.true(parser.isNesting(n));
    t.false(parser.isContainer(n));
    t.false(parser.isNamespace(n));
});

test('pseudo class guard', ':hover', (t, tree) => {
    let n = node(tree);
    t.true(parser.isNode(n));
    t.false(parser.isPseudo(undefined));
    t.true(parser.isPseudo(n));
    t.true(parser.isPseudoClass(n));
    t.false(parser.isPseudoElement(n));
    t.true(parser.isContainer(n));
    t.false(parser.isNamespace(n));
});

test('pseudo element guard', '::first-line', (t, tree) => {
    let n = node(tree);
    t.true(parser.isNode(n));
    t.false(parser.isPseudo(undefined));
    t.true(parser.isPseudo(n));
    t.false(parser.isPseudoClass(n));
    t.true(parser.isPseudoElement(n));
    t.true(parser.isContainer(n));
    t.false(parser.isNamespace(n));
});

test('special pseudo element guard', ':before:after:first-letter:first-line', (t, tree) => {
    [node(tree), node(tree, 1), node(tree, 2), node(tree, 3)].forEach((n) => {
        t.true(parser.isPseudo(n));
        t.false(parser.isPseudoClass(n));
        t.true(parser.isPseudoElement(n));
        t.true(parser.isContainer(n));
        t.false(parser.isNamespace(n));
    });
});

test('special pseudo element guard (uppercase)', ':BEFORE:AFTER:FIRST-LETTER:FIRST-LINE', (t, tree) => {
    [node(tree), node(tree, 1), node(tree, 2), node(tree, 3)].forEach((n) => {
        t.true(parser.isPseudo(n));
        t.false(parser.isPseudoClass(n));
        t.true(parser.isPseudoElement(n));
        t.true(parser.isContainer(n));
        t.false(parser.isNamespace(n));
    });
});

test('string guard', '"string"', (t, tree) => {
    let n = node(tree);
    t.true(parser.isNode(n));
    t.false(parser.isString(undefined));
    t.true(parser.isString(n));
    t.false(parser.isContainer(n));
    t.false(parser.isNamespace(n));
});

test('tag guard', 'h1', (t, tree) => {
    let n = node(tree);
    t.false(parser.isNode(undefined));
    t.true(parser.isNode(n));
    t.false(parser.isTag(undefined));
    t.true(parser.isTag(n));
    t.false(parser.isContainer(n));
    t.true(parser.isNamespace(n));
});

test('universal guard', '*', (t, tree) => {
    let n = node(tree);
    t.true(parser.isNode(n));
    t.false(parser.isUniversal(undefined));
    t.true(parser.isUniversal(n));
    t.false(parser.isContainer(n));
    t.false(parser.isNamespace(n));
});
