import ava from 'ava';
import parser from '../index.js';

// Regression tests for CVE-2026-9358 / SNYK-JS-POSTCSSSELECTORPARSER-16873882:
// uncontrolled recursion when parsing or serializing deeply nested selectors
// must surface as a catchable Error instead of overflowing the call stack.

const DEFAULT_MAX = 256;

// Build a selector string of `depth` nested `:not(...)` pseudo classes.
const nest = depth => ':not('.repeat(depth) + 'a' + ')'.repeat(depth);

// Build a deeply nested AST programmatically, bypassing the parse-time guard,
// so the serialization (toString) guard is exercised on its own.
function buildDeepAst (depth) {
    const root = parser.root({});
    const top = parser.selector({});
    root.append(top);
    let current = top;
    for (let i = 0; i < depth; i++) {
        const pseudo = parser.pseudo({value: ':not'});
        const sel = parser.selector({});
        pseudo.append(sel);
        current.append(pseudo);
        current = sel;
    }
    current.append(parser.tag({value: 'a'}));
    return root;
}

ava('reasonably nested selectors still round-trip', t => {
    const input = nest(10);
    t.is(parser().processSync(input), input);
});

ava('parsing beyond the max nesting depth throws a catchable error', t => {
    const error = t.throws(
        () => parser().astSync(nest(DEFAULT_MAX + 50)),
        {instanceOf: Error}
    );
    t.regex(error.message, /nesting depth exceeds the maximum/);
    t.false(error instanceof RangeError, 'should not be a stack overflow RangeError');
});

ava('serializing beyond the max nesting depth throws a catchable error', t => {
    const deep = buildDeepAst(1000);
    const error = t.throws(() => deep.toString(), {instanceOf: Error});
    t.regex(error.message, /nesting depth exceeds the maximum/);
    t.false(error instanceof RangeError, 'should not be a stack overflow RangeError');
});

ava('the original PoC payload no longer crashes the process', t => {
    t.throws(() => parser().processSync(nest(50000)), {instanceOf: Error});
});

ava('maxNestingDepth option can tighten the limit', t => {
    const error = t.throws(
        () => parser().astSync(nest(20), {maxNestingDepth: 5}),
        {instanceOf: Error}
    );
    t.regex(error.message, /maximum of 5/);
});

ava('maxNestingDepth option can loosen the limit', t => {
    const input = nest(DEFAULT_MAX + 20);
    t.notThrows(() => parser().astSync(input, {maxNestingDepth: DEFAULT_MAX + 100}));
});
