import ava from 'ava';
import parser from '../index.js';

// Regression tests for CVE-2026-9358 / SNYK-JS-POSTCSSSELECTORPARSER-16873882:
// uncontrolled recursion when parsing or serializing deeply nested selectors
// must surface as a catchable Error instead of overflowing the call stack.
//
// The default-limit tests assert only the stable contract — a controlled Error
// that is NOT a RangeError stack overflow — so they don't break if the default
// is tuned. Tests that assert on a specific limit always set it explicitly via
// the `maxNestingDepth` option, so they never depend on the default value.

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

ava('parsing a deeply nested hostile selector throws instead of overflowing the stack', t => {
    const error = t.throws(() => parser().astSync(nest(1000)), {instanceOf: Error});
    t.false(error instanceof RangeError, 'should be a controlled error, not a stack overflow');
});

ava('serializing a deeply nested AST throws instead of overflowing the stack', t => {
    const deep = buildDeepAst(1000);
    const error = t.throws(() => deep.toString(), {instanceOf: Error});
    t.false(error instanceof RangeError, 'should be a controlled error, not a stack overflow');
});

ava('maxNestingDepth option controls the limit in both directions', t => {
    const input = nest(40);
    // A low limit rejects it and reports the configured value...
    const error = t.throws(
        () => parser().astSync(input, {maxNestingDepth: 10}),
        {instanceOf: Error}
    );
    t.regex(error.message, /\b10\b/);
    // ...while a high limit accepts the very same selector.
    t.notThrows(() => parser().astSync(input, {maxNestingDepth: 100}));
});
