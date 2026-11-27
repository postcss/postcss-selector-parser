import { test } from "node:test";
import assert from "node:assert/strict";
import parser from "../../dist/index.js";

test("absent attribute parts have no output offset", () => {
  const node = parser().astSync("[href]").first.first;
  for (const part of ["operator", "value", "insensitive", "sensitive", "unknown"]) {
    assert.equal(node.offsetOf(part), -1, part);
  }
  assert.equal(node.offsetOf("attribute"), 1);
});

test("constructed attribute offsets include leading and inserted whitespace", () => {
  for (const flag of ["insensitive", "sensitive"]) {
    for (const before of ["", "  "]) {
      const node = parser.attribute({
        attribute: "href",
        operator: "=",
        value: "link",
        quoteMark: null,
        [flag]: true,
        spaces: { before },
      });
      const output = String(node);
      assert.equal(node.offsetOf("attribute"), output.indexOf("href"));
      assert.equal(node.offsetOf("operator"), output.indexOf("="));
      assert.equal(node.offsetOf("value"), output.indexOf("link"));
      assert.equal(node.offsetOf(flag), output.length - 2);
    }
  }
});

test("parsed quoted values and flags keep their exact offsets", () => {
  const node = parser().astSync('[a="" s]').first.first;
  assert.equal(node.offsetOf("value"), 3);
  assert.equal(node.offsetOf("sensitive"), 6);
  assert.equal(node.offsetOf("insensitive"), -1);
});
