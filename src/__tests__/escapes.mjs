import { test } from "./util/helpers.mjs";

test("escaped semicolon in class", ".\\;", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, ";");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\;");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
});

test("escaped semicolon in id", "#\\;", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, ";");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\;");
  t.deepEqual(tree.nodes[0].nodes[0].type, "id");
});

for (const [delimiter, type] of [
  [".", "class"],
  ["#", "id"],
]) {
  test(`escaped backslash before the ${type} delimiter`, `.foo\\\\${delimiter}bar`, (t, tree) => {
    t.deepEqual(
      tree.first.nodes.map(({ type, value }) => [type, value]),
      [
        ["class", "foo\\"],
        [type, "bar"],
      ],
    );
  });

  test(
    `escaped ${type} delimiter after an escaped backslash`,
    `.foo\\\\\\${delimiter}bar`,
    (t, tree) => {
      t.deepEqual(
        tree.first.nodes.map(({ type, value }) => [type, value]),
        [["class", `foo\\${delimiter}bar`]],
      );
    },
  );
}

// This is a side-effect of allowing media queries to be parsed. Not sure it shouldn't just be an error.
test("bare parens capture contents as a string", "(h1)", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "(h1)");
  t.deepEqual(tree.nodes[0].nodes[0].type, "string");
});

for (const hex of ["61", "000061"]) {
  for (const whitespace of [" ", "\t", "\n", "\r", "\f", "\r\n"]) {
    test(
      `hex escape ${hex} terminated by ${JSON.stringify(whitespace)}`,
      `[x="\\${hex}${whitespace}b"]`,
      (t, tree) => {
        t.is(tree.first.first.value, "ab");
      },
    );
  }
}

for (const [value, expected] of [
  ["\\000061  b", "a b"],
  ["\\000000 b", "\uFFFDb"],
  ["\\00D800 b", "\uFFFDb"],
  ["\\110000 b", "\uFFFDb"],
  ["\\000061b", "ab"],
  ["\\000061\u00a0b", "a\u00a0b"],
  ["\\000061\vb", "a\vb"],
]) {
  test(`hex escape boundary ${JSON.stringify(value)}`, `[x="${value}"]`, (t, tree) => {
    t.is(tree.first.first.value, expected);
  });
}
