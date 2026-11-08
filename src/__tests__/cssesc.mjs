import ava from "./util/runner.mjs";
import cssescModule from "../../dist/util/cssesc.js";

const cssesc = cssescModule.default;

// src/util/cssesc.js is adapted from cssesc 3.0.0, with a linear replacement for
// the regular expression that removed redundant spaces after hex escapes. The
// expected values below were produced by cssesc 3.0.0 itself, so these tests
// pin the vendored copy to the upstream output.
const CASES = [
  ["defaults when no options are given", "a b\"c'd\\e", null, "a b\"c\\'d\\\\e"],
  ["identifier escaping", "a.b#c:d[e]", { isIdentifier: true }, "a\\.b\\#c\\:d\\[e\\]"],
  ["identifier starting with a digit", "1a", { isIdentifier: true }, "\\31 a"],
  ["identifier starting with a hyphen and a digit", "-1a", { isIdentifier: true }, "\\-1a"],
  ["identifier starting with two hyphens", "--a", { isIdentifier: true }, "\\--a"],
  ["single quotes are escaped by default in strings", "a'b\"c", {}, "a\\'b\"c"],
  ["double quotes", "a'b\"c", { quotes: "double" }, "a'b\\\"c"],
  ["unknown quotes fall back to single", "a'b\"c", { quotes: "backtick" }, "a\\'b\"c"],
  ["wrapped in single quotes", "a'b", { wrap: true }, "'a\\'b'"],
  ["wrapped in double quotes", 'a"b', { quotes: "double", wrap: true }, '"a\\"b"'],
  ["wrap is ignored for identifiers", "a b", { isIdentifier: true, wrap: true }, "a\\ b"],
  ["escape everything", "a-b.c 1", { escapeEverything: true }, "\\61\\2D\\62\\.\\63\\ \\31"],
  ["control and non-ASCII characters", "a\u0001bcéd\n", {}, "a\\1 b\\7F c\\E9 d\\A"],
  ["astral characters", "a😀b", {}, "a\\1F600 b"],
  ["unmatched high surrogate", "a\ud800b", {}, "a\\D800 b"],
  ["high surrogate at the end", "a\ud800", {}, "a\\D800"],
  ["lone low surrogate", "a\udc00b", {}, "a\\DC00 b"],
  ["redundant space after an escape is removed", "\u0001g", {}, "\\1g"],
  ["space kept before a hex digit", "\u0001a", {}, "\\1 a"],
  ["space kept before a space", "\u0001 ", {}, "\\1  "],
  ["space removed at the end", "\u0001", {}, "\\1"],
  ["an escaped backslash before an escape", "\\\u0001g", {}, "\\\\\\1g"],
  [
    "two escaped backslashes before an escape",
    "\\\\\u0001g",
    { isIdentifier: true },
    "\\\\\\\\\\1g",
  ],
  ["six hex digits", "􏿿g", {}, "\\10FFFFg"],
  ["leading digit escape in an identifier", "1 a", { isIdentifier: true }, "\\31\\ a"],
  ["only backslashes", "\\\\\\", { isIdentifier: true }, "\\\\\\\\\\\\"],
];

for (const [description, input, options, expected] of CASES) {
  ava(`cssesc: ${description}`, (t) => {
    t.is(cssesc(input, options), expected);
  });
}

ava("cssesc: does not mutate the options it is given", (t) => {
  const options = { quotes: "backtick" };
  cssesc("a", options);
  t.deepEqual(options, { quotes: "backtick" });
});
