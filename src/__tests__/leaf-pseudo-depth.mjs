import test from "./util/runner.mjs";
import parser from "../../dist/index.js";

test("a zero nesting limit permits nonfunctional pseudo selectors", (t) => {
  const input = "a:hover::before";
  t.is(parser().processSync(input, { maxNestingDepth: 0 }), input);
  t.is(parser().astSync(input).toString({ maxNestingDepth: 0 }), input);
});

test("leaf pseudo selectors do not add nesting inside a functional pseudo", (t) => {
  const input = ":is(a:hover, b::before)";
  t.is(parser().processSync(input, { maxNestingDepth: 1 }), input);
  t.is(parser().astSync(input).toString({ maxNestingDepth: 1 }), input);
});

test("functional pseudos still enforce the serialization nesting limit", (t) => {
  const root = parser().astSync(":is(:not(a))");
  t.throws(() => root.toString({ maxNestingDepth: 1 }), { message: /nesting depth/ });
  t.throws(() => parser().astSync(":is(a)").toString({ maxNestingDepth: 0 }), /nesting depth/);
});
