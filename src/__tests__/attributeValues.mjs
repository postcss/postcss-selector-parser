import assert from "node:assert/strict";
import test from "./util/runner.mjs";
import parser from "../../dist/index.js";
import postcss from "postcss";

const message = "Expected an attribute value.";
const operators = ["=", "~=", "|=", "^=", "$=", "*="];

for (const operator of operators) {
  test(`missing attribute value after ${operator}`, (t) => {
    const input = `[href${operator}]`;
    t.throws(() => parser().processSync(input), { message });
    t.throws(() => parser().astSync(input), { message });
  });

  test(`quoted empty attribute value after ${operator}`, (t) => {
    for (const quote of ['"', "'"]) {
      const input = `[href${operator}${quote}${quote} i]`;
      const attribute = parser().astSync(input).first.first;
      t.is(attribute.value, "");
      t.is(attribute.operator, operator);
      t.is(attribute.insensitive, true);
      t.is(parser().processSync(input), input);
    }
  });

  test(`unquoted attribute value after ${operator}`, (t) => {
    const input = `[href${operator}example]`;
    t.is(parser().astSync(input).first.first.value, "example");
    t.is(parser().processSync(input), input);
  });
}

for (const input of [
  "[href= ]",
  "[href=\n\t ]",
  "[href=/**/]",
  "[href= /* value */ ]",
  "[ns|href=]",
  "[*|href=]",
  "[|href=]",
  "[ ns | href = ]",
]) {
  test(`missing attribute value in ${JSON.stringify(input)}`, (t) => {
    t.throws(() => parser().processSync(input), { message });
    t.throws(() => parser().processSync(input, { lossless: false }), { message });
  });
}

test("missing attribute value rejects asynchronous processing", async () => {
  await assert.rejects(parser().process("[href=]"), { message });
  await assert.rejects(parser().ast("[href=]"), { message });
});

test("missing attribute value reports the closing bracket location", (t) => {
  const rule = postcss.parse("a,\n  [href=] {}").first;
  const error = t.throws(() => parser().processSync(rule));
  t.is(error.name, "CssSyntaxError");
  t.is(error.reason, message);
  t.is(error.line, 2);
  t.is(error.column, 9);
});

test("presence and namespaced quoted-empty attributes remain valid", (t) => {
  for (const input of [
    "[href]",
    "[ns|href]",
    '[ns|href=""]',
    "[*|href='']",
    '[|href="" i]',
    '[ ns | href = "" ]',
    '[href=/**/""/* value */]',
  ]) {
    t.is(parser().processSync(input), input);
  }
  t.is(parser().processSync('[ ns | href = "" ]', { lossless: false }), '[ns|href=""]');
});
