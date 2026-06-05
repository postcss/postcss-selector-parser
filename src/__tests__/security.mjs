// PoC scripts adapted from: https://gist.github.com/bx33661/581e3a38134601c04e19b4dfc9b459b9                                             
// Credit: https://github.com/bx33661

import test from 'ava';
import postcss from 'postcss';

import parser from '../index.js';

function buildDeepPseudoTree (depth) {
    const { pseudo, selector, tag } = parser;
    let current = selector({ nodes: [tag({value: 'a'})] });
    for (let i = 0; i < depth; i++) {
        const p = pseudo({ value: ':not', nodes: [current] });
        current = selector({ nodes: [p] });
    }
    return current;
}

test('toString() does not stack overflow on deeply nested programmatic tree', t => {
    const deep = buildDeepPseudoTree(1000);
    t.notThrows(() => deep.toString());
});

test('processSync() with deep selector does not stack overflow', t => {
    const depth = 1000;
    const malicious = ':where('.repeat(depth) + 'a' + ')'.repeat(depth);
    const rule = postcss.parse(malicious + ' {}').first;
    t.notThrows(() =>
        parser((selectors) => {}).processSync(rule, { updateSelector: true })
    );
});

test('clone() does not stack overflow on deeply nested programmatic tree', t => {
    const deep = buildDeepPseudoTree(1100);
    t.notThrows(() => deep.clone());
});
