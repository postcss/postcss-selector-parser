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

for (const quoteMark of ['"', "'"]) {
  for (const newline of ["\n", "\r\n", "\r", "\f"]) {
    const value = `a\\${newline}b`;
    const selector = `[title=${quoteMark}${value}${quoteMark}]`;
    test(
      `quoted line continuation ${JSON.stringify(quoteMark)} ${JSON.stringify(newline)}`,
      selector,
      (t, tree) => {
        const attribute = tree.first.first;
        t.is(attribute.value, "ab");
        t.is(attribute.raws.value, `${quoteMark}${value}${quoteMark}`);
        t.is(attribute.getQuotedValue(), `${quoteMark}ab${quoteMark}`);
        attribute.setValue(attribute.value);
        t.is(tree.toString(), `[title=${quoteMark}ab${quoteMark}]`);
      },
    );
  }
}

for (const [value, expected] of [
  [`a${"\\".repeat(3)}\nb`, "a\\b"],
  ["a\\\tb", "a\tb"],
  ["a\\ b", "a b"],
  ["a\\a b", "a\nb"],
]) {
  test(`quoted continuation boundary ${JSON.stringify(value)}`, `[x="${value}"]`, (t, tree) => {
    t.is(tree.first.first.value, expected);
  });
}
