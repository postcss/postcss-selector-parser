import { test } from "./util/helpers.mjs";

test("non-standard selector", ".icon.is-$(network)", (t, tree) => {
  let class1 = tree.nodes[0].nodes[0];
  t.deepEqual(class1.value, "icon");
  t.deepEqual(class1.type, "class");
  let class2 = tree.nodes[0].nodes[1];
  t.deepEqual(class2.value, "is-$(network)");
  t.deepEqual(class2.type, "class");
});

test("at word in selector", "em@il.com", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "em@il");
  t.deepEqual(tree.nodes[0].nodes[1].value, "com");
});

test("leading combinator", "> *", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, ">");
  t.deepEqual(tree.nodes[0].nodes[1].value, "*");
});

test("sass escapes", ".#{$classname}", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].value, "#{$classname}");
});

test("sass escapes (2)", "[lang=#{$locale}]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].type, "attribute");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "lang");
  t.deepEqual(tree.nodes[0].nodes[0].operator, "=");
  t.deepEqual(tree.nodes[0].nodes[0].value, "#{$locale}");
});

test("sass interpolation as an attribute name", "[#{$attr}]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].type, "attribute");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "#{$attr}");
  t.deepEqual(tree.nodes[0].nodes[0].operator, undefined);
  t.deepEqual(tree.nodes[0].nodes[0].value, undefined);
});

test("sass variable as an attribute name", "[$attr]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "$attr");
  t.deepEqual(tree.nodes[0].nodes[0].operator, undefined);
});

test(
  "sass interpolation on both sides of an attribute selector",
  "[#{$attr}=#{$value}]",
  (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, "#{$attr}");
    t.deepEqual(tree.nodes[0].nodes[0].operator, "=");
    t.deepEqual(tree.nodes[0].nodes[0].value, "#{$value}");
  },
);

// The `$` opening the name must not be mistaken for the suffix match operator,
// and the `$=` that follows must still parse as one.
test("sass variable name with a suffix match operator", '[$attr$="x"]', (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "$attr");
  t.deepEqual(tree.nodes[0].nodes[0].operator, "$=");
  t.deepEqual(tree.nodes[0].nodes[0].value, "x");
});

test("namespaced sass variable attribute name", "[ns|$attr]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].namespace, "ns");
  t.deepEqual(tree.nodes[0].nodes[0].attribute, "$attr");
});

test("placeholder", "%foo", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].type, "tag");
  t.deepEqual(tree.nodes[0].nodes[0].value, "%foo");
});

test("styled selector", "${Step}", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].type, "tag");
  t.deepEqual(tree.nodes[0].nodes[0].value, "${Step}");
});

test("styled selector (2)", "${Step}:nth-child(odd)", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].type, "tag");
  t.deepEqual(tree.nodes[0].nodes[0].value, "${Step}");
  t.deepEqual(tree.nodes[0].nodes[1].type, "pseudo");
  t.deepEqual(tree.nodes[0].nodes[1].value, ":nth-child");
  t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].type, "tag");
  t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, "odd");
});
