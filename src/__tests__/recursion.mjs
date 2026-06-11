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

ava('cloning a deeply nested AST throws instead of overflowing the stack', t => {
    const deep = buildDeepAst(1000);
    const error = t.throws(() => deep.clone(), {instanceOf: Error});
    t.false(error instanceof RangeError, 'should be a controlled error, not a stack overflow');
});

ava('walking a deeply nested AST throws instead of overflowing the stack', t => {
    const deep = buildDeepAst(1000);
    const error = t.throws(() => deep.walk(() => {}), {instanceOf: Error});
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

ava('the parse and serialize limits stay in sync through processSync', t => {
    const input = nest(40);
    // With a raised limit, parsing AND the implicit toString() in processSync
    // must both succeed and round-trip the selector unchanged.
    t.is(parser().processSync(input, {maxNestingDepth: 100}), input);
    // With a low limit, the same call fails (at parse time) instead of crashing.
    t.throws(() => parser().processSync(input, {maxNestingDepth: 10}), {instanceOf: Error});
});

ava('toString accepts an explicit maxNestingDepth for programmatic ASTs', t => {
    const deep = buildDeepAst(40);
    // Default limit (256) serializes it fine.
    t.notThrows(() => deep.toString());
    // A tightened limit rejects it with a controlled error...
    const error = t.throws(() => deep.toString({maxNestingDepth: 10}), {instanceOf: Error});
    t.false(error instanceof RangeError);
    t.regex(error.message, /\b10\b/);
});

ava('invalid maxNestingDepth values fall back to the safe default', t => {
    // NaN, Infinity, negatives and non-numbers must not disable the guard:
    // a hostile payload still throws a controlled error rather than crashing.
    for (const bad of [NaN, Infinity, -1, '256', null]) {
        const error = t.throws(
            () => parser().astSync(nest(1000), {maxNestingDepth: bad}),
            {instanceOf: Error}
        );
        t.false(error instanceof RangeError, `value ${String(bad)} should keep the guard active`);
    }
});
