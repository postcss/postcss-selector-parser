import test from "./util/runner.mjs";
import parser from "../../dist/index.js";

test("multiline comments retain their original start position", (t) => {
  const input = ".a/*one\ntwo*/.b";
  const root = parser().astSync(input);
  const comment = root.first.at(1);
  t.deepEqual(comment.source.start, { line: 1, column: 3 });
  t.deepEqual(comment.source.end, { line: 2, column: 5 });
  t.is(root.atPosition(1, 4), comment);
  t.is(root.atPosition(2, 4), comment);
  t.deepEqual(root.first.last.source.start, { line: 2, column: 6 });
  t.is(String(root), input);
});

test("escaped line continuations advance following selector positions", (t) => {
  const input = '[data-text="one\\\ntwo"].after';
  const root = parser().astSync(input);
  t.deepEqual(root.first.first.source.end, { line: 2, column: 5 });
  t.deepEqual(root.first.last.source.start, { line: 2, column: 6 });
  t.is(root.atPosition(2, 6), root.first.last);
  t.is(String(root), input);
});
