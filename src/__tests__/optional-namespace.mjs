import assert from "node:assert/strict";
import test from "node:test";
import parser from "../../dist/index.js";

const factories = [
  ["tag", (options) => parser.tag({ value: "article", ...options }), "article"],
  ["universal", (options) => parser.universal(options), "*"],
  ["attribute", (options) => parser.attribute({ attribute: "lang", ...options }), "[lang]"],
];

for (const [name, create, text] of factories) {
  test(`${name} accepts an explicitly absent optional namespace`, () => {
    const node = create({ namespace: undefined });
    assert.equal(node.namespace, undefined);
    assert.equal(String(node), text);
  });

  for (const property of ["namespace", "ns"]) {
    test(`${name} clears an escaped namespace through ${property}`, () => {
      const node = create({ namespace: "my ns" });
      assert.equal(node.raws.namespace, "my\\ ns");
      node[property] = undefined;
      assert.equal(node.namespace, undefined);
      assert.equal(node.raws.namespace, undefined);
      assert.equal(String(node), text);

      node.namespace = "svg";
      assert.equal(String(node), name === "attribute" ? "[svg|lang]" : `svg|${text}`);
    });
  }
}

test("cloning a tag can clear its optional namespace", () => {
  const original = parser.tag({ value: "article", namespace: "svg" });
  const clone = original.clone({ namespace: undefined });
  assert.equal(String(clone), "article");
  assert.equal(String(original), "svg|article");
});
