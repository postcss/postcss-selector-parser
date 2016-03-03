import test from 'ava';
import parser from '../index';

test('parser#attribute', (t) => {
    let node = parser.attribute({attribute: 'href'});
    t.same(String(node), '[href]');
});

test('parser#className', (t) => {
    let node = parser.className({value: 'classy'});
    t.same(String(node), '.classy');
});

test('parser#combinator', (t) => {
    let node = parser.combinator({value: '>>'});
    t.same(String(node), '>>');
});

test('parser#comment', (t) => {
    let node = parser.comment({value: '/* comment */'});
    t.same(String(node), '/* comment */');
});

test('parser#id', (t) => {
    let node = parser.id({value: 'test'});
    t.same(String(node), '#test');
});

test('parser#pseudo', (t) => {
    let node = parser.pseudo({value: '::before'});
    t.same(String(node), '::before');
});

test('parser#string', (t) => {
    let node = parser.string({value: '"wow"'});
    t.same(String(node), '"wow"');
});

test('parser#tag', (t) => {
    let node = parser.tag({value: 'button'});
    t.same(String(node), 'button');
});

test('parser#universal', (t) => {
    let node = parser.universal();
    t.same(String(node), '*');
});

test('construct a whole tree', (t) => {
    let root = parser.root();
    let selector = parser.selector();
    selector.append(parser.id({value: 'tree'}));
    root.append(selector);
    t.same(String(root), '#tree');
});

test('no operation', (t) => {
    t.notThrows(() => parser().process('h1 h2 h3').result);
});

test('empty selector string', (t) => {
    t.notThrows(() => {
        return parser((selectors) => {
            selectors.walk((selector) => {
                selector.type = 'tag';
            });
        }).process('').result;
    });
});
