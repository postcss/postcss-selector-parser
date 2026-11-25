import assert from "node:assert/strict";
import test from "node:test";
import parser from "../../dist/index.js";

const guards = [
  "isNode",
  "isAttribute",
  "isClassName",
  "isCombinator",
  "isComment",
  "isIdentifier",
  "isNesting",
  "isPseudo",
  "isRoot",
  "isSelector",
  "isString",
  "isTag",
  "isUniversal",
  "isPseudoElement",
  "isPseudoClass",
  "isContainer",
  "isNamespace",
];

for (const name of guards) {
  test(`${name} returns false for absent values and non-nodes`, () => {
    for (const value of [null, undefined, false, 0, "tag", {}, [], { type: "unknown" }]) {
      assert.equal(parser[name](value), false);
    }
  });
}

test("isNode does not recognize unrelated Object member names as node types", () => {
  for (const type of ["constructor", "toString", "hasOwnProperty"]) {
    assert.equal(parser.isNode({ type }), false);
  }
});
