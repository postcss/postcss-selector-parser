import assert from "node:assert/strict";
import test from "node:test";
import parser from "../../dist/index.js";

test("an explicitly empty raw spelling suppresses a comment when serializing a selector", () => {
  const root = parser().astSync("a/*note*/.b");
  const comment = root.first.nodes[1];
  comment.setPropertyAndEscape("value", comment.value, "");

  assert.equal(comment.value, "/*note*/");
  assert.equal(comment.stringifyProperty("value"), "");
  assert.equal(String(root), "a.b");
  assert.equal(String(root.clone()), "a.b");
});

for (const [value, escaped] of [
  ["article", "article"],
  ["a b", "a\\ b"],
]) {
  test(`appending ${JSON.stringify(escaped)} preserves an existing empty raw spelling`, () => {
    const node = parser.string({ value: "placeholder", raws: { value: "" } });
    node.appendToPropertyAndEscape("value", value, escaped);

    assert.equal(node.value, `placeholder${value}`);
    assert.equal(node.raws.value, escaped);
    assert.equal(String(node), escaped);
  });
}

test("appending another empty raw spelling keeps the combined spelling empty", () => {
  const node = parser.string({ value: "first", raws: { value: "" } });
  node.appendToPropertyAndEscape("value", "second", "");

  assert.equal(node.value, "firstsecond");
  assert.equal(node.raws.value, "");
  assert.equal(String(node), "");
});

test("removing an empty raw override restores the property's value", () => {
  const node = parser.string({ value: "before", raws: { value: "" } });
  node.setPropertyWithoutEscape("value", "after");
  assert.equal(String(node), "after");
});

test("null and undefined raw spellings still fall back to the property's value", () => {
  for (const raw of [null, undefined]) {
    const node = parser.string({ value: "article", raws: { value: raw } });
    assert.equal(String(node), "article");
    node.appendToPropertyAndEscape("value", " a", "\\ a");
    assert.equal(String(node), "article\\ a");
  }
});

test("lossy parsing preserves the required descendant combinator", () => {
  for (const selector of ["a b", "a  b", "a\tb", "a\nb"]) {
    assert.equal(parser().processSync(selector, { lossless: false }), "a b");
  }
});
