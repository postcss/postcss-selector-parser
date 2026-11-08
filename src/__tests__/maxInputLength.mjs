import ava from "./util/runner.mjs";
import postcss from "postcss";
import parser from "../../dist/index.js";

ava("no limit applies by default", (t) => {
  const input = ".a".repeat(50000);
  t.is(parser().processSync(input), input);
});

ava("a selector of exactly maxInputLength characters is accepted", (t) => {
  t.is(parser().processSync("a".repeat(10), { maxInputLength: 10 }), "a".repeat(10));
});

ava("a selector longer than maxInputLength is rejected with a controlled error", (t) => {
  const error = t.throws(() => parser().astSync("a".repeat(11), { maxInputLength: 10 }), {
    instanceOf: Error,
  });
  t.false(error instanceof TypeError);
  t.regex(error.message, /\b11\b/);
  t.regex(error.message, /\b10\b/);
});

ava("the limit is enforced before the selector is tokenized or parsed", (t) => {
  // Without the limit this input fails with a parse error of its own.
  t.throws(() => parser().astSync("[".repeat(11), { maxInputLength: 10 }), {
    message: /exceeds the maximum/,
  });
});

ava("the limit reports through the rule when given a PostCSS rule", (t) => {
  const rule = postcss.parse("abcdef{}").first;
  const error = t.throws(() => parser().astSync(rule, { maxInputLength: 3 }), {
    message: /exceeds the maximum/,
  });
  t.is(error.name, "CssSyntaxError");
});

ava("the limit applies to every synchronous entry point", (t) => {
  t.throws(() => parser().processSync("ab", { maxInputLength: 1 }), {
    message: /exceeds the maximum/,
  });
  t.throws(() => parser().transformSync("ab", { maxInputLength: 1 }), {
    message: /exceeds the maximum/,
  });
});

ava("the asynchronous API rejects instead of throwing", async (t) => {
  await parser()
    .ast("ab", { maxInputLength: 1 })
    .then(
      () => t.fail("expected a rejection"),
      (error) => t.regex(error.message, /exceeds the maximum/),
    );
});

ava("Infinity explicitly disables the limit", (t) => {
  t.notThrows(() => parser().astSync("ab", { maxInputLength: Infinity }));
});

ava("invalid limits throw rather than silently disabling the guard", (t) => {
  for (const bad of [NaN, -1, 1.5, "65536", null]) {
    t.throws(() => parser().astSync("a", { maxInputLength: bad }), { instanceOf: TypeError });
  }
});
