import { test } from "./util/helpers.mjs";
import apiTest from "./util/runner.mjs";
import parser from "../../dist/index.js";

test("class name", ".one", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "one");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
});

test("multiple class names", ".one.two.three", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "one");
  t.deepEqual(tree.nodes[0].nodes[1].value, "two");
  t.deepEqual(tree.nodes[0].nodes[2].value, "three");
});

test("qualified class", "button.btn-primary", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].type, "tag");
  t.deepEqual(tree.nodes[0].nodes[1].type, "class");
});

test("escaped numbers in class name", ".\\31\\ 0", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].value, "1 0");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\31\\ 0");
});

test("extraneous non-combinating whitespace", "  .h1   ,  .h2   ", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "h1");
  t.deepEqual(tree.nodes[0].nodes[0].spaces.before, "  ");
  t.deepEqual(tree.nodes[0].nodes[0].spaces.after, "   ");
  t.deepEqual(tree.nodes[1].nodes[0].value, "h2");
  t.deepEqual(tree.nodes[1].nodes[0].spaces.before, "  ");
  t.deepEqual(tree.nodes[1].nodes[0].spaces.after, "   ");
});

test("Less interpolation within a class", ".foo@{bar}", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes.length, 1);
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].value, "foo@{bar}");
});

test("ClassName#set value", ".fo\\o", (t, selectors) => {
  let className = selectors.first.first;
  t.deepEqual(className.raws, { value: "fo\\o" });
  className.value = "bar";
  t.deepEqual(className.raws, {});
});

test("escaped dot in class name", ".foo\\.bar", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].value, "foo.bar");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "foo\\.bar");
});

test("class selector with escaping", ".♥", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "♥");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
});

test("class selector with escaping (1)", ".©", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "©");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
});

test("class selector with escaping (2)", ".“‘’”", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "“‘’”");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
});

test("class selector with escaping (3)", ".☺☃", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "☺☃");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
});

test("class selector with escaping (4)", ".⌘⌥", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "⌘⌥");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
});

test("class selector with escaping (5)", ".𝄞♪♩♫♬", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "𝄞♪♩♫♬");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
});

test("class selector with escaping (6)", ".💩", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "💩");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
});

test("class selector with escaping (7)", ".\\?", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "?");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\?");
});

test("class selector with escaping (8)", ".\\@", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "@");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\@");
});

test("class selector with escaping (9)", ".\\.", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, ".");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\.");
});

test("class selector with escaping (10)", ".\\3A \\)", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, ":)");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\3A \\)");
});

test("class selector with escaping (11)", ".\\3A \\`\\(", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, ":`(");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\3A \\`\\(");
});

test("class selector with escaping (12)", ".\\31 23", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "123");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\31 23");
});

test("class selector with escaping (13)", ".\\31 a2b3c", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "1a2b3c");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\31 a2b3c");
});

test("class selector with escaping (14)", ".\\<p\\>", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "<p>");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\<p\\>");
});

test("class selector with escaping (15)", ".\\<\\>\\<\\<\\<\\>\\>\\<\\>", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "<><<<>><>");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\<\\>\\<\\<\\<\\>\\>\\<\\>");
});

test(
  "class selector with escaping (16)",
  ".\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\[\\>\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\>\\+\\<\\<\\<\\<\\-\\]\\>\\+\\+\\.\\>\\+\\.\\+\\+\\+\\+\\+\\+\\+\\.\\.\\+\\+\\+\\.\\>\\+\\+\\.\\<\\<\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\.\\>\\.\\+\\+\\+\\.\\-\\-\\-\\-\\-\\-\\.\\-\\-\\-\\-\\-\\-\\-\\-\\.\\>\\+\\.\\>\\.",
  (t, tree) => {
    t.deepEqual(
      tree.nodes[0].nodes[0].value,
      "++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.",
    );
    t.deepEqual(tree.nodes[0].nodes[0].type, "class");
    t.deepEqual(
      tree.nodes[0].nodes[0].raws.value,
      "\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\[\\>\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\>\\+\\<\\<\\<\\<\\-\\]\\>\\+\\+\\.\\>\\+\\.\\+\\+\\+\\+\\+\\+\\+\\.\\.\\+\\+\\+\\.\\>\\+\\+\\.\\<\\<\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\.\\>\\.\\+\\+\\+\\.\\-\\-\\-\\-\\-\\-\\.\\-\\-\\-\\-\\-\\-\\-\\-\\.\\>\\+\\.\\>\\.",
    );
  },
);

test("class selector with escaping (17)", ".\\#", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "#");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\#");
});

test("class selector with escaping (18)", ".\\#\\#", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "##");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\#\\#");
});

test("class selector with escaping (19)", ".\\#\\.\\#\\.\\#", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "#.#.#");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\#\\.\\#\\.\\#");
});

test("class selector with escaping (20)", ".\\_", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "_");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\_");
});

test("class selector with escaping (21)", ".\\{\\}", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "{}");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\{\\}");
});

test("class selector with escaping (22)", ".\\#fake\\-id", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "#fake-id");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\#fake\\-id");
});

test("class selector with escaping (23)", ".foo\\.bar", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "foo.bar");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "foo\\.bar");
});

test("class selector with escaping (24)", ".\\3A hover", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, ":hover");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\3A hover");
});

test("class selector with escaping (25)", ".\\3A hover\\3A focus\\3A active", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, ":hover:focus:active");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\3A hover\\3A focus\\3A active");
});

test("class selector with escaping (26)", ".\\[attr\\=value\\]", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "[attr=value]");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\[attr\\=value\\]");
});

test("class selector with escaping (27)", ".f\\/o\\/o", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "f/o/o");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "f\\/o\\/o");
});

test("class selector with escaping (28)", ".f\\\\o\\\\o", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "f\\o\\o");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "f\\\\o\\\\o");
});

test("class selector with escaping (29)", ".f\\*o\\*o", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "f*o*o");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "f\\*o\\*o");
});

test("class selector with escaping (30)", ".f\\!o\\!o", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "f!o!o");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "f\\!o\\!o");
});

test("class selector with escaping (31)", ".f\\'o\\'o", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "f'o'o");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "f\\'o\\'o");
});

test("class selector with escaping (32)", ".f\\~o\\~o", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "f~o~o");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "f\\~o\\~o");
});

test("class selector with escaping (33)", ".f\\+o\\+o", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "f+o+o");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "f\\+o\\+o");
});

test("class selector with escaping (34)", ".\\1D306", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "𝌆");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "\\1D306");
});

test("class selector with escaping (35)", ".not-pseudo\\:focus", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "not-pseudo:focus");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "not-pseudo\\:focus");
});

test("class selector with escaping (36)", ".not-pseudo\\:\\:focus", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "not-pseudo::focus");
  t.deepEqual(tree.nodes[0].nodes[0].type, "class");
  t.deepEqual(tree.nodes[0].nodes[0].raws.value, "not-pseudo\\:\\:focus");
});

for (const [value, escaped] of [
  ["hover:bg-blue", "hover\\:bg-blue"],
  ["1abc", "\\31 abc"],
  ["foo.bar", "foo\\.bar"],
  ["foo\\bar", "foo\\\\bar"],
  ["♥", "\\2665"],
]) {
  apiTest(`ClassName constructor escapes ${value}`, (t) => {
    const className = parser.className({ value });
    t.is(className.value, value);
    t.is(className.toString(), `.${escaped}`, "constructor must escape the semantic value");
    t.is(parser().astSync(className.toString()).first.first.value, value);
  });
}

apiTest("ClassName constructor preserves explicit raw spelling in either option order", (t) => {
  for (const opts of [
    { value: "hover:bg-blue", raws: { value: "hover\\3A bg-blue" } },
    { raws: { value: "hover\\3A bg-blue" }, value: "hover:bg-blue" },
  ]) {
    const className = parser.className(opts);
    t.is(className.value, "hover:bg-blue");
    t.is(className.toString(), ".hover\\3A bg-blue");
  }
});

apiTest("ClassName constructor without a value still supports later assignment", (t) => {
  const className = parser.className();
  t.is(className.value, undefined);
  className.value = "hover:bg-blue";
  t.is(className.toString(), ".hover\\:bg-blue");
});

apiTest("ClassName constructor leaves a plain identifier and other raw properties intact", (t) => {
  const plain = parser.className({ value: "button" });
  t.is(plain.toString(), ".button");
  t.is(plain.raws, undefined);
  const className = parser.className({
    value: "hover:bg-blue",
    raws: { spaces: { before: "/* before */" } },
  });
  t.is(
    className.toString(),
    "/* before */.hover\\:bg-blue",
    "other raw fields must not suppress escaping",
  );
});

apiTest(
  "ClassName clones preserve raw spelling and escape replacement values independently",
  (t) => {
    const original = parser.className({
      value: "hover:bg-blue",
      raws: { value: "hover\\3A bg-blue" },
    });
    const clone = original.clone();
    t.is(clone.toString(), original.toString());
    t.not(clone.raws, original.raws);
    const replaced = original.clone({ value: "focus:bg-red" });
    t.is(replaced.toString(), ".focus\\:bg-red");
    t.is(original.toString(), ".hover\\3A bg-blue");
  },
);

apiTest("Parsed classes keep their original raw state when cloned", (t) => {
  for (const input of [".button", ".♥", ".foo@{bar}", ".hover\\3A bg-blue"]) {
    const original = parser().astSync(input).first.first;
    const clone = original.clone();
    t.is(clone.toString(), input);
    t.deepEqual(clone.raws, original.raws);
    if (!input.includes("\\")) {
      t.is(original.raws, undefined);
    }
  }
});
