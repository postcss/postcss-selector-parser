import { test } from "../util/helpers.mjs";

test("id selector", "#foo", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "foo");
});

test("escaped special char", "#w\\+", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "w+");
});

test("tailing escape", "#foo\\", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "foo\\");
});

test("double escape", "#wow\\\\k", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "wow\\k");
});

test("leading numeric", ".\\31 23", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "123");
});

test("emoji", ".\\🐐", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "🐐");
});

// https://www.w3.org/International/questions/qa-escapes#cssescapes
test("hex escape", ".\\E9motion", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "émotion");
});

test("hex escape with space", ".\\E9 dition", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "édition");
});

test("hex escape with hex number", ".\\0000E9dition", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "édition");
});

test("class selector with escaping", ".\\1D306", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "𝌆");
});

test("class selector with escaping with more chars", ".\\1D306k", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "𝌆k");
});

test("class selector with escaping with more chars with whitespace", ".wow\\1D306 k", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "wow𝌆k");
});

test("handles 0 value hex", "\\0", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, String.fromCodePoint(0xfffd));
});

test("handles lone surrogate value hex", "\\DBFF", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, String.fromCodePoint(0xfffd));
});

test("handles out of bound values", "\\110000", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, String.fromCodePoint(0xfffd));
});
