import { throws } from "./util/helpers.mjs";

// Unclosed elements
throws("unclosed string", 'a[href="wow]');
throws("unclosed comment", "/* oops");
throws("unclosed pseudo element", "button::");
throws("unclosed pseudo class", "a:");
throws("unclosed attribute selector", '[name="james"][href');

// Constructs left open at end of input. These threw a raw TypeError before
// `attribute`, `namespace` and `parentheses` guarded against running out of
// tokens. Asserted by message rather than by type: the default
// `{instanceOf: Error}` check is satisfied by a TypeError, which is why the
// existing "unclosed attribute selector" case above passed throughout.
throws(
  "unclosed attribute at end of input",
  "a[href",
  "Expected a closing square bracket.",
);
throws(
  "unclosed attribute with value at end of input",
  "a[href=x",
  "Expected a closing square bracket.",
);
throws("trailing namespace pipe", ".foo|", "Unexpected '|'.");
throws(
  "unclosed parenthesis at end of input",
  "a(",
  "Expected a closing parenthesis.",
);

throws("no opening parenthesis", ")");
throws("no opening parenthesis (2)", ":global.foo)");
throws("no opening parenthesis (3)", "h1:not(h2:not(h3)))");

throws("no opening square bracket", "]");
throws("no opening square bracket (2)", ":global.foo]");
throws("no opening square bracket (3)", "[global]]");

throws("bad pseudo element", 'button::"after"');
throws("missing closing parenthesis in pseudo", ':not([attr="test"]:not([attr="test"])');

throws("bad syntax", "-moz-osx-font-smoothing: grayscale");
throws("bad syntax (2)", "! .body");

throws("missing backslash for semicolon", ".;");
throws("missing backslash for semicolon (2)", ".\;");
throws(
  "unexpected / foo",
  "-Option\/root",
  "Unexpected '/'. Escaping special characters with \\ may help.",
);
throws(
  "bang in selector",
  ".foo !optional",
  "Unexpected '!'. Escaping special characters with \\ may help.",
);
