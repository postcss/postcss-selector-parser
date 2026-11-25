import { test } from "node:test";
import assert from "node:assert/strict";
import parser from "../../dist/index.js";

test("new and removed selector nodes have no siblings", () => {
  const detached = parser.className({ value: "new" });
  assert.equal(detached.prev(), undefined);
  assert.equal(detached.next(), undefined);
  const selector = parser().astSync("a.b#c").first;
  const middle = selector.at(1);
  assert.equal(middle.prev(), selector.first);
  assert.equal(middle.next(), selector.last);
  middle.remove();
  assert.equal(middle.prev(), undefined);
  assert.equal(middle.next(), undefined);
  assert.equal(selector.first.next(), selector.last);
  assert.equal(selector.last.prev(), selector.first);
});
