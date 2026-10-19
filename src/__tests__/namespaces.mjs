import { test, throws } from "./util/helpers.mjs";

test("match tags in the postcss namespace", "postcss|button", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "postcss");
  t.deepEqual(tree.nodes[0].nodes[0].value, "button");
});

test("match everything in the postcss namespace", "postcss|*", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "postcss");
  t.deepEqual(tree.nodes[0].nodes[0].value, "*");
});

test("match any namespace", "*|button", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "*");
  t.deepEqual(tree.nodes[0].nodes[0].value, "button");
});

test("match all elements within the postcss namespace", "postcss|*", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "postcss");
  t.deepEqual(tree.nodes[0].nodes[0].value, "*");
});

test("match all elements in all namespaces", "*|*", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "*");
  t.deepEqual(tree.nodes[0].nodes[0].value, "*");
});

test("match all elements without a namespace", "|*", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
  t.deepEqual(tree.nodes[0].nodes[0].value, "*");
});

test("match tags with no namespace", "|button", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
  t.deepEqual(tree.nodes[0].nodes[0].value, "button");
});

test("match namespace inside attribute selector", "[postcss|href=test]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "postcss");
  t.deepEqual(tree.nodes[0].nodes[0].value, "test");
});

test("match namespace inside attribute selector (2)", "[postcss|href]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "postcss");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "href");
});

test("match namespace inside attribute selector (3)", "[*|href]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "*");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "href");
});

test("match default namespace inside attribute selector", "[|href]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "href");
});

test("match default namespace inside attribute selector with spaces", "[ |href ]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "href");
});

test("attribute namespace with a space before the separator", "[foo |bar]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "foo");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "bar");
});

test("attribute namespace with a space after the separator", "[foo| bar]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "foo");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "bar");
});

test("attribute namespace with spaces around the separator", "[ foo | bar ]", (t, tree) => {
  const attr = tree.nodes[0].nodes[0];
  t.deepEqual(attr.namespace, "foo");
  t.deepEqual(attr.attribute, "bar");
  t.deepEqual(attr.spaces.attribute.before, " ");
  t.deepEqual(attr.spaces.attribute.after, " ");
});

test(
  "attribute namespace with multiple spaces around the separator",
  "[  foo  |  bar  ]",
  (t, tree) => {
    const attr = tree.nodes[0].nodes[0];
    t.deepEqual(attr.namespace, "foo");
    t.deepEqual(attr.attribute, "bar");
    t.deepEqual(attr.spaces.attribute.before, "  ");
    t.deepEqual(attr.spaces.attribute.after, "  ");
  },
);

test(
  "attribute namespace with spaces around the separator and a value",
  "[ foo | bar = baz ]",
  (t, tree) => {
    const attr = tree.nodes[0].nodes[0];
    t.deepEqual(attr.namespace, "foo");
    t.deepEqual(attr.attribute, "bar");
    t.deepEqual(attr.operator, "=");
    t.deepEqual(attr.value, "baz");
  },
);

test(
  "attribute namespace with spaces around the separator and a quoted value",
  '[ foo | bar = "baz" i ]',
  (t, tree) => {
    const attr = tree.nodes[0].nodes[0];
    t.deepEqual(attr.namespace, "foo");
    t.deepEqual(attr.attribute, "bar");
    t.deepEqual(attr.value, "baz");
    t.deepEqual(attr.insensitive, true);
  },
);

test("empty attribute namespace with a space after the separator", "[ | href ]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "href");
});

test("empty attribute namespace with a space after the separator only", "[| href]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, true);
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "href");
});

test("any attribute namespace with a space before the separator", "[* |href]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "*");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "href");
});

test("any attribute namespace with spaces around the separator", "[ * | href ]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "*");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "href");
});

test("escaped attribute namespace with a space before the separator", "[f\\oo |bar]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "foo");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "bar");
});

test("escaped attribute name with a space after the separator", "[foo| b\\or]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "foo");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "bor");
});

test("dash match operator is not an attribute namespace separator", "[ href |= en ]", (t, tree) => {
  const attr = tree.nodes[0].nodes[0];
  t.deepEqual(attr.namespace, undefined);
  t.deepEqual(attr.attribute, "href");
  t.deepEqual(attr.operator, "|=");
  t.deepEqual(attr.value, "en");
});

test("dash match operator after an attribute namespace", "[ a | b |= c ]", (t, tree) => {
  const attr = tree.nodes[0].nodes[0];
  t.deepEqual(attr.namespace, "a");
  t.deepEqual(attr.attribute, "b");
  t.deepEqual(attr.operator, "|=");
  t.deepEqual(attr.value, "c");
});

test("namespace with qualified id selector", "ns|h1#foo", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "ns");
});

test("namespace with qualified class selector", "ns|h1.foo", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "ns");
});

test("ns alias for namespace", "f\\oo|h1.foo", (t, tree) => {
  let tag = tree.nodes[0].nodes[0];
  t.deepEqual(tag.namespace, "foo");
  t.deepEqual(tag.ns, "foo");
  tag.ns = "bar";
  t.deepEqual(tag.namespace, "bar");
  t.deepEqual(tag.ns, "bar");
});

test("empty namespace after a comment is not a prefix", "/* c */|b", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[1].namespace, true);
  t.deepEqual(tree.nodes[0].nodes[1].value, "b");
});

test("empty namespace after a comma is not a prefix", ".a,|b", (t, tree) => {
  t.deepEqual(tree.nodes[1].nodes[0].namespace, true);
  t.deepEqual(tree.nodes[1].nodes[0].value, "b");
});

test("empty namespace after a combinator is not a prefix", ".a > |b", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[2].namespace, true);
  t.deepEqual(tree.nodes[0].nodes[2].value, "b");
});

throws("attribute namespace with no attribute name", "[foo |*=en]");
throws("attribute namespace with an empty attribute name", "[foo | =en]");

throws("lone pipe symbol", "|");
throws("lone pipe symbol with leading spaces", " |");
throws("lone pipe symbol with trailing spaces", "| ");
throws("lone pipe symbol with surrounding spaces", " | ");
throws("trailing pipe symbol with a namespace", "foo| ");
throws("trailing pipe symbol with any namespace", "*| ");
