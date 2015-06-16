import test from 'tape';
import parser from '../index';

test('parser#attribute', (t) => {
    let node = parser.attribute({attribute: 'href'});
    t.plan(1);
    t.equal(String(node), '[href]');
});

test('parser#className', (t) => {
    let node = parser.className({value: 'classy'});
    t.plan(1);
    t.equal(String(node), '.classy');
});

test('parser#combinator', (t) => {
    let node = parser.combinator({value: '>>'});
    t.plan(1);
    t.equal(String(node), '>>');
});

test('parser#comment', (t) => {
    let node = parser.combinator({value: '/* comment */'});
    t.plan(1);
    t.equal(String(node), '/* comment */');
});

test('parser#id', (t) => {
    let node = parser.id({value: 'test'});
    t.plan(1);
    t.equal(String(node), '#test');
});

test('parser#pseudo', (t) => {
    let node = parser.pseudo({value: '::before'});
    t.plan(1);
    t.equal(String(node), '::before');
});

test('parser#tag', (t) => {
    let node = parser.tag({value: 'button'});
    t.plan(1);
    t.equal(String(node), 'button');
});

test('parser#tag', (t) => {
    let node = parser.universal();
    t.plan(1);
    t.equal(String(node), '*');
});

test('construct a whole tree', (t) => {
    let root = parser.root();
    let selector = parser.selector();
    selector.append(parser.id({value: 'tree'}));
    root.append(selector);
    t.plan(1);
    t.equal(String(root), '#tree');
});

test('no operation', (t) => {
    t.plan(1);
    t.doesNotThrow(() => {
        return parser().process('h1 h2 h3').result;
    });
});

test('empty selector string', (t) => {
    t.plan(1);
    t.doesNotThrow(() => {
        return parser((selectors) => {
            selectors.eachInside((selector) => {
                selector.type = 'tag';
            });
        }).process('').result;
    });
});
