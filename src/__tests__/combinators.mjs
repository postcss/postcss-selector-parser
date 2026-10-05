import selectorTypes from "../../dist/selectors/types.js";
import parser from "../../dist/index.js";
import ava from "./util/runner.mjs";
import { test } from "./util/helpers.mjs";

const COMBINATOR = selectorTypes.COMBINATOR;

test("multiple combinating spaces", "h1         h2", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "h1");
  t.deepEqual(tree.nodes[0].nodes[1].value, " ");
  t.deepEqual(tree.nodes[0].nodes[1].toString(), "         ");
  t.deepEqual(tree.nodes[0].nodes[2].value, "h2");
});

test("column combinator", ".selected||td", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "selected");
  t.deepEqual(tree.nodes[0].nodes[1].value, "||");
  t.deepEqual(tree.nodes[0].nodes[2].value, "td");
});

test("column combinator (2)", ".selected || td", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "selected");
  t.deepEqual(tree.nodes[0].nodes[1].spaces.before, " ");
  t.deepEqual(tree.nodes[0].nodes[1].value, "||");
  t.deepEqual(tree.nodes[0].nodes[1].spaces.after, " ");
  t.deepEqual(tree.nodes[0].nodes[2].value, "td");
});

test("descendant combinator", "h1 h2", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "h1");
  t.deepEqual(tree.nodes[0].nodes[1].value, " ");
  t.deepEqual(tree.nodes[0].nodes[2].value, "h2");
});

test("multiple descendant combinators", "h1 h2 h3 h4", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[1].value, " ", "should have a combinator");
  t.deepEqual(tree.nodes[0].nodes[3].value, " ", "should have a combinator");
  t.deepEqual(tree.nodes[0].nodes[5].value, " ", "should have a combinator");
});

test("adjacent sibling combinator", "h1~h2", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "h1");
  t.deepEqual(tree.nodes[0].nodes[1].value, "~");
  t.deepEqual(tree.nodes[0].nodes[2].value, "h2");
});

test("adjacent sibling combinator (2)", "h1 ~h2", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "h1");
  t.deepEqual(tree.nodes[0].nodes[1].spaces.before, " ");
  t.deepEqual(tree.nodes[0].nodes[1].value, "~");
  t.deepEqual(tree.nodes[0].nodes[2].value, "h2");
});

test("adjacent sibling combinator (3)", "h1~ h2", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "h1");
  t.deepEqual(tree.nodes[0].nodes[1].value, "~");
  t.deepEqual(tree.nodes[0].nodes[1].spaces.after, " ");
  t.deepEqual(tree.nodes[0].nodes[2].value, "h2");
});

test("adjacent sibling combinator (4)", "h1 ~ h2", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "h1");
  t.deepEqual(tree.nodes[0].nodes[1].spaces.before, " ");
  t.deepEqual(tree.nodes[0].nodes[1].value, "~");
  t.deepEqual(tree.nodes[0].nodes[1].spaces.after, " ");
  t.deepEqual(tree.nodes[0].nodes[2].value, "h2");
});

test("adjacent sibling combinator (5)", "h1~h2~h3", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "h1");
  t.deepEqual(tree.nodes[0].nodes[1].value, "~");
  t.deepEqual(tree.nodes[0].nodes[2].value, "h2");
  t.deepEqual(tree.nodes[0].nodes[3].value, "~");
  t.deepEqual(tree.nodes[0].nodes[4].value, "h3");
});

test("piercing combinator", ".a >>> .b", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "a");
  t.deepEqual(tree.nodes[0].nodes[1].spaces.before, " ");
  t.deepEqual(tree.nodes[0].nodes[1].value, ">>>");
  t.deepEqual(tree.nodes[0].nodes[1].spaces.after, " ");
  t.deepEqual(tree.nodes[0].nodes[2].value, "b");
});

test("named combinators", "a /deep/ b", (t, tree) => {
  let nodes = tree.nodes[0].nodes;
  t.deepEqual(nodes[0].value, "a");
  t.deepEqual(nodes[1].type, COMBINATOR);
  t.deepEqual(nodes[1].toString(), " /deep/ ");
  t.deepEqual(nodes[1].value, "/deep/");
  t.deepEqual(nodes[2].value, "b");
});

test("named combinators with escapes", "a /dee\\p/ b", (t, tree) => {
  let nodes = tree.nodes[0].nodes;
  t.deepEqual(nodes[0].value, "a");
  t.deepEqual(nodes[1].type, COMBINATOR);
  t.deepEqual(nodes[1].toString(), " /dee\\p/ ");
  t.deepEqual(nodes[1].value, "/deep/");
  t.deepEqual(nodes[2].value, "b");
});

test("named combinators with escapes and uppercase", "a /DeE\\p/ b", (t, tree) => {
  let nodes = tree.nodes[0].nodes;
  t.deepEqual(nodes[0].value, "a");
  t.deepEqual(nodes[1].type, COMBINATOR);
  t.deepEqual(nodes[1].toString(), " /DeE\\p/ ");
  t.deepEqual(nodes[1].value, "/deep/");
  t.deepEqual(nodes[2].value, "b");
});

test("multiple combinators", "h1~h2>h3", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[1].value, "~", "should have a combinator");
  t.deepEqual(tree.nodes[0].nodes[3].value, ">", "should have a combinator");
});

test("multiple combinators with whitespaces", "h1 + h2 > h3", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[1].value, "+", "should have a combinator");
  t.deepEqual(tree.nodes[0].nodes[3].value, ">", "should have a combinator");
});

test("multiple combinators with whitespaces (2)", "h1+ h2 >h3", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[1].value, "+", "should have a combinator");
  t.deepEqual(tree.nodes[0].nodes[3].value, ">", "should have a combinator");
});

test("trailing combinator & spaces", "p +        ", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "p", "should be a paragraph");
  t.deepEqual(tree.nodes[0].nodes[1].value, "+", "should have a combinator");
});

test("trailing sibling combinator", "p ~", (t, tree) => {
  t.deepEqual(tree.nodes[0].nodes[0].value, "p", "should be a paragraph");
  t.deepEqual(tree.nodes[0].nodes[1].value, "~", "should have a combinator");
});

test("ending in comment has no trailing combinator", ".bar /* comment 3 */", (t, tree) => {
  let nodeTypes = tree.nodes[0].map((n) => n.type);
  t.deepEqual(nodeTypes, ["class"]);
});
test("The combinating space is not a space character", ".bar\n.baz", (t, tree) => {
  let nodeTypes = tree.nodes[0].map((n) => n.type);
  t.deepEqual(nodeTypes, ["class", "combinator", "class"]);
  t.deepEqual(tree.nodes[0].nodes[1].value, " ", "should have a combinator");
  t.deepEqual(tree.nodes[0].nodes[1].raws.value, "\n", "should have a raw combinator value");
});
test(
  "with spaces and a comment has only one combinator",
  ".bar /* comment 3 */ > .foo",
  (t, tree) => {
    let nodeTypes = tree.nodes[0].map((n) => n.type);
    t.deepEqual(nodeTypes, ["class", "combinator", "class"]);
  },
);

test(
  "with a meaningful comment in the middle of a compound selector",
  "div/* wtf */.foo",
  (t, tree) => {
    let nodeTypes = tree.nodes[0].map((n) => n.type);
    t.deepEqual(nodeTypes, ["tag", "comment", "class"]);
  },
);

test("with a comment in the middle of a descendant selector", "div/* wtf */ .foo", (t, tree) => {
  let nodeTypes = tree.nodes[0].map((n) => n.type);
  t.deepEqual(nodeTypes, ["tag", "comment", "combinator", "class"]);
});

for (const [title, input, value, expected] of [
  ["replaces a tab descendant", "a\tb", ">", "a>b"],
  ["normalizes a newline descendant", "a\nb", " ", "a b"],
  ["replaces mixed descendant whitespace", "a\r\n\tb", "+", "a+b"],
  ["replaces an escaped named combinator", "a /DeE\\p/ b", ">", "a > b"],
  ["replaces comments embedded in the raw value", "a\t/*raw*/\nb", ">", "a>b"],
  [
    "keeps comments in separate spaces",
    "a /*before*/ > /*after*/ b",
    "+",
    "a /*before*/ + /*after*/ b",
  ],
]) {
  test(`Combinator#set value ${title}`, input, (t, tree) => {
    tree.first.nodes[1].value = value;
    t.is(tree.toString(), expected, "the assigned value must be serialized");
    t.is(
      parser().astSync(expected).first.nodes[1].value,
      value,
      "the selector must keep the new semantics",
    );
  });
}

ava("Combinator constructor preserves raw values in either option order", (t) => {
  for (const options of [
    { value: " ", raws: { value: "\t" } },
    { raws: { value: "\t" }, value: " " },
  ]) {
    const combinator = parser.combinator(options);
    t.is(combinator.toString(), "\t", "constructor options must preserve raw spelling");
    combinator.value = ">";
    t.is(combinator.toString(), ">", "later assignments must replace raw spelling");
  }
});

test(
  "Combinator#clone value overrides invalidate only the clone's raw value",
  "a\nb",
  (t, tree) => {
    const combinator = tree.first.nodes[1];
    t.is(combinator.clone().toString(), "\n", "ordinary clones preserve raw spelling");
    t.is(combinator.clone({ value: ">" }).toString(), ">", "value overrides replace raw spelling");
    t.is(combinator.toString(), "\n", "clone overrides leave the original unchanged");
  },
);

test("Combinator raw helpers replace or extend embedded comments", "a\t/*raw*/\nb", (t, tree) => {
  const combinator = tree.first.nodes[1];
  const escaped = combinator.clone();
  escaped.setPropertyAndEscape("value", " ", "\t/*new*/\n");
  t.is(escaped.toString(), "\t/*new*/\n", "the helper can replace raw spelling");

  const appended = combinator.clone();
  appended.appendToPropertyAndEscape("value", " ", "\t");
  t.is(appended.toString(), "\t/*raw*/\n\t", "appending preserves each embedded comment once");

  const unescaped = combinator.clone();
  unescaped.setPropertyWithoutEscape("value", ">");
  t.is(unescaped.toString(), ">", "the helper can discard raw spelling");
  t.is(combinator.toString(), "\t/*raw*/\n", "helpers on clones leave the original unchanged");
});
