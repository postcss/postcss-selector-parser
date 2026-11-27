import { throws } from "./util/helpers.mjs";

// Unclosed elements
throws("unclosed string", 'a[href="wow]');
throws("unclosed comment", "/* oops");
throws("unclosed pseudo element", "button::");
throws("unclosed pseudo class", "a:");
throws("unclosed attribute selector", '[name="james"][href');

for (const selector of [".", "a.", ".a..b", "#a.", ":not(.)", "a > ."]) {
  throws(`empty class name in ${selector}`, selector, "Expected a class name.");
}
for (const selector of ["#", "a#", "#a#", ".a#", ":is(#)", "a, #"]) {
  throws(`empty ID in ${selector}`, selector, "Expected an id.");
}

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
// A `(` with nothing after it, at the start or right after a pseudo, still
// threw a raw TypeError: there was no token to start the new node at.
for (const selector of ["(", ":not(", "a:hover(", "a, ("]) {
  throws(
    `unclosed parenthesis with nothing after it in ${selector}`,
    selector,
    "Expected a closing parenthesis.",
  );
}

// An attribute selector whose last token before `]` is one of `* $ ^ ~ |`.
// The `attribute` token loop looked ahead to `next` without checking it
// existed, so these threw a raw TypeError. Asserted by message for the same
// reason as the cases above.
throws(
  "namespaced attribute name is an asterisk",
  "[ns|*]",
  "Expected an attribute.",
);
throws("default namespace with asterisk name", "[|*]", "Expected an attribute.");
throws("any namespace with asterisk name", "[*|*]", "Expected an attribute.");
throws(
  "namespaced attribute ending in a dollar",
  "[ns|$]",
  "Expected an attribute.",
);
throws(
  "namespaced attribute ending in a caret",
  "[ns|^]",
  "Expected an attribute.",
);

// A bracket pair that contains no attribute name at all. `toString` used to
// interpolate the string "undefined" into the output.
throws("universal selector as an attribute", "[ * ]", "Expected an attribute.");
throws(
  "asterisk name with trailing space",
  "[ns|* ]",
  "Expected an attribute.",
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

// Content between an attribute operator and a quoted value used to be
// silently dropped: `[class=XXX'@{foo}-']` parsed as `[class='@{foo}-']`
// and `[class=~'@{foo}-']` parsed as `[class='@{foo}-']`.
throws(
  "unquoted value before a quoted value",
  "[class=XXX'@{foo}-']",
  "Unexpected string found; an attribute value was already defined.",
);
throws(
  "bare tilde before a quoted value",
  "[class=~'@{foo}-']",
  'Unexpected "~" found; an operator was already defined.',
);
