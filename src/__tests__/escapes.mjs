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

for (const hex of ["61", "000061"]) {
  for (const whitespace of [" ", "\t", "\n", "\r", "\f", "\r\n"]) {
    for (const [prefix, suffix, type] of [
      [".", "", "class"],
      ["#", "", "id"],
      ["", "", "tag"],
      ["[x=", "]", "attribute"],
    ]) {
      test(
        `${type} hex escape ${hex} terminated by ${JSON.stringify(whitespace)}`,
        `${prefix}\\${hex}${whitespace}b${suffix}`,
        (t, tree) => {
          t.is(tree.first.nodes.length, 1);
          t.is(tree.first.first.type, type);
          t.is(tree.first.first.value, "ab");
        },
      );
    }
  }
}

for (const whitespace of [" ", "\t", "\n", "\r", "\f", "\r\n"]) {
  test(
    `only one whitespace terminates a hex escape: ${JSON.stringify(whitespace)}`,
    `.\\000061${whitespace} b`,
    (t, tree) => {
      t.deepEqual(
        tree.first.nodes.map(({ type, value }) => [type, value]),
        [
          ["class", "a"],
          ["combinator", " "],
          ["tag", "b"],
        ],
      );
    },
  );
}

for (const newline of ["\n", "\r\n"]) {
  test(
    `source positions after an escaped ${JSON.stringify(newline)}`,
    `.\\61${newline}b.next > c`,
    (t, tree) => {
      const [first, second, combinator, last] = tree.first.nodes;
      t.deepEqual(first.source, { start: { line: 1, column: 1 }, end: { line: 2, column: 1 } });
      t.deepEqual(second.source, { start: { line: 2, column: 2 }, end: { line: 2, column: 6 } });
      t.deepEqual(last.source, { start: { line: 2, column: 10 }, end: { line: 2, column: 10 } });
      t.is(combinator.source.start.line, 2);
      t.is(second.sourceIndex, 5 + newline.length);
    },
  );
  test(
    `source positions after an escaped ${JSON.stringify(newline)} and interpolation`,
    `.\\61${newline}b#{$foo}.next > a`,
    (t, tree) => {
      const [first, second, , last] = tree.first.nodes;
      t.is(first.value, "ab#{$foo}");
      t.is(first.sourceIndex, 0);
      t.deepEqual(first.source, { start: { line: 1, column: 1 }, end: { line: 2, column: 8 } });
      t.is(second.sourceIndex, 12 + newline.length);
      t.deepEqual(second.source, { start: { line: 2, column: 9 }, end: { line: 2, column: 13 } });
      t.deepEqual(last.source, { start: { line: 2, column: 17 }, end: { line: 2, column: 17 } });
    },
  );
}
