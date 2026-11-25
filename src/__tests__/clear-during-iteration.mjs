import { test } from "node:test";
import assert from "node:assert/strict";
import parser from "../../dist/index.js";

for (const clear of ["removeAll", "empty"]) {
  test(`${clear} keeps iteration on newly appended children`, () => {
    const selector = parser().astSync("a.b").first;
    const oldChildren = selector.nodes.slice();
    const seen = [];
    selector.each((node) => {
      seen.push(node.value);
      if (node.value === "a") {
        selector[clear]().append(parser.tag({ value: "c" }));
      }
    });
    assert.deepEqual(seen, ["a", "c"]);
    assert.equal(String(selector), "c");
    assert.ok(oldChildren.every((node) => node.parent === undefined));
  });
}
