import { test } from "node:test";
import assert from "node:assert/strict";
import parser from "../../dist/index.js";

for (const method of ["astSync", "transformSync", "processSync"]) {
  test(`${method} respects configured updates and per-call overrides`, () => {
    const processor = parser(
      (root) => {
        root.first.first.value = "new";
      },
      { updateSelector: true },
    );
    const rule = { selector: ".old" };
    processor[method](rule);
    assert.equal(rule.selector, ".new");
    const preserved = { selector: ".old" };
    processor[method](preserved, { updateSelector: false });
    assert.equal(preserved.selector, ".old");
    const defaultRule = { selector: ".old" };
    parser((root) => {
      root.first.first.value = "new";
    })[method](defaultRule);
    assert.equal(defaultRule.selector, ".old");
  });
}
