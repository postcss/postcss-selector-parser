import ava from "./util/runner.mjs";
import postcss from "postcss";
import parser from "../../dist/index.js";

// Regression tests for the quadratic parsing of flat selectors: `.` and `#` are
// not word delimiters, so `.a.a.a...` reaches splitWord as a single word token
// carrying n class indexes. Three passes used to scan those index arrays
// linearly for every index, making the parse O(n^2):
//
//   1. uniqs(), deduplicating with filter + indexOf
//   2. the indices.forEach loop, calling hasClass.indexOf / hasId.indexOf
//   3. the Sass-interpolation filter, calling interpolations.indexOf
//
// Nesting depth is 0 for such a selector, so maxNestingDepth offers no
// protection. All three now use Set membership tests.

const N = 60000;

// Fastest of a few runs, to shrug off GC pauses and scheduling noise.
function fastest(input) {
  let best = Infinity;
  for (let i = 0; i < 3; i++) {
    const start = process.hrtime.bigint();
    parser().astSync(input);
    best = Math.min(best, Number(process.hrtime.bigint() - start) / 1e6);
  }
  return best;
}

// Compare the hostile payload (one word token holding N indexes) against a
// benign control of the same repeated atom, space separated, which forces the
// same amount of real parsing work spread over N word tokens. Deriving the
// budget from a measurement taken on the same machine keeps this stable across
// CI runners and under coverage instrumentation, where an absolute time budget
// or a raw input-scaling ratio would not be.
//
// The control does strictly more work than the payload once parsing is linear,
// so a healthy ratio sits below 1. It reached 4-8 while the passes were
// quadratic. The threshold sits well clear of both.
function costRatio(atom) {
  const hostile = fastest(atom.repeat(N));
  const benign = fastest(`${atom} `.repeat(N));
  return hostile / Math.max(benign, 1);
}

for (const [label, atom] of [
  ["flat class selectors", ".a"],
  ["flat id selectors", "#a"],
  ["repeated Sass interpolations", "#{a}"],
]) {
  ava(`${label} parse in time proportional to their size`, (t) => {
    const ratio = costRatio(atom);
    t.true(
      ratio < 2,
      `parsing "${atom}" repeated ${N} times as one token cost ${ratio.toFixed(1)}x the same atoms parsed separately, which suggests a super-linear pass`,
    );
  });
}

// Further quadratic sites, outside the index passes above. Each payload is
// compared with a control of the same size that takes the linear path, since
// the space-separated control above does not apply to all of them (spaces
// between comments still form a comment-only selector).
//
//   - splitWord evaluated the whole-word @keyframes percent test once per `.`
//     index, and the regex backtracks across a leading run of digits.
//   - space() checked that the current selector held only comments by
//     scanning all of its nodes for every space token.
//   - parentheses() appended each group following a node to that node's
//     value one at a time, and the value setter of class and attribute nodes
//     escapes the whole value on every assignment.
//   - cssesc, which escapes namespaces as they are parsed, removed redundant
//     spaces with a regular expression that backtracks quadratically on runs
//     of backslashes. It is now vendored in src/util/cssesc.js with a linear
//     replacement.
//
// Healthy ratios sit around 1 or below; they ranged from 40 to 240 while
// these passes were quadratic.
for (const [label, size, hostile, control] of [
  [
    "a digit-prefixed flat selector",
    20000,
    (n) => "1".repeat(n) + ".a".repeat(n),
    (n) => "a".repeat(n) + ".a".repeat(n),
  ],
  ["a comment-only selector", 20000, (n) => "/**/ ".repeat(n), (n) => "a " + "/**/ ".repeat(n - 1)],
  [
    "a run of parenthesis groups after a class",
    4000,
    (n) => ".a" + "( )".repeat(n),
    (n) => ".a( )".repeat(n),
  ],
  [
    "a run of parenthesis groups after an attribute",
    4000,
    (n) => "[a=b]" + "( )".repeat(n),
    (n) => "[a=b]( )".repeat(n),
  ],
  [
    "a namespace made of backslashes",
    8000,
    (n) => "\\".repeat(n) + "|a",
    (n) => "a".repeat(n) + "|a",
  ],
  [
    "an attribute namespace made of backslashes",
    8000,
    (n) => "[" + "\\".repeat(n) + "|a]",
    (n) => "[" + "a".repeat(n) + "|a]",
  ],
]) {
  ava(`${label} parses in time proportional to its size`, (t) => {
    const ratio = fastest(hostile(size)) / Math.max(fastest(control(size)), 1);
    t.true(
      ratio < 5,
      `${label} cost ${ratio.toFixed(1)}x a control of the same size, which suggests a super-linear pass`,
    );
  });
}

ava("consecutive parenthesis groups are appended to the preceding node", (t) => {
  const nodes = parser().astSync(".a( )(b)").first.nodes;
  t.is(nodes.length, 1);
  t.is(nodes[0].type, "class");
  t.is(nodes[0].value, "a( )(b)");
});

ava("an unclosed group after complete ones reports its own opening parenthesis", (t) => {
  const rule = postcss.parse("x{}").first;
  rule.selector = "a()()(";
  const error = t.throws(() => parser().astSync(rule), { message: /closing parenthesis/ });
  // Column 6 is the last `(`, not the first group's.
  t.is(error.column, 6);
});

ava("decimal percentages are still kept as a single tag", (t) => {
  const nodes = parser().astSync("12.5%").first.nodes;
  t.is(nodes.length, 1);
  t.is(nodes[0].type, "tag");
  t.is(nodes[0].value, "12.5%");
});

ava("spaces after leading comments stay attached to the selector", (t) => {
  const input = "/**/ /**/ a";
  t.is(parser().processSync(input), input);
  t.is(
    parser()
      .astSync(input)
      .first.nodes.filter((node) => node.type === "comment").length,
    2,
  );
});

ava("a large flat selector still produces one node per class", (t) => {
  const tree = parser().astSync(".a".repeat(20000));
  const nodes = tree.first.nodes;
  t.is(nodes.length, 20000);
  t.true(nodes.every((node) => node.type === "class" && node.value === "a"));
});

// The leading 0 pushed into the index list collides with hasClass[0] or
// hasId[0] whenever the word starts with `.` or `#`, so the deduplication in
// uniqs() is load-bearing: dropping it emits a spurious first node covering the
// whole word. These pin that down.
ava("deduplication keeps a leading class from being emitted twice", (t) => {
  t.deepEqual(
    parser()
      .astSync(".a.b")
      .first.nodes.map((node) => [node.type, node.value]),
    [
      ["class", "a"],
      ["class", "b"],
    ],
  );
});

ava("deduplication keeps a leading id from being emitted twice", (t) => {
  t.deepEqual(
    parser()
      .astSync("#x.y")
      .first.nodes.map((node) => [node.type, node.value]),
    [
      ["id", "x"],
      ["class", "y"],
    ],
  );
});

ava("a single leading class is emitted once", (t) => {
  const nodes = parser().astSync(".a").first.nodes;
  t.is(nodes.length, 1);
  t.is(nodes[0].type, "class");
});
