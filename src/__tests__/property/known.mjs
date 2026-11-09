// Failures the property tests already know about. Each entry names what
// tracks it and matches only the failures it explains, so anything new still
// fails the run. Remove an entry when its fix lands; a stale entry is harmless
// but hides nothing either, since it no longer matches.
const PR = "https://github.com/postcss/postcss-selector-parser/pull/";
const ISSUE = "https://github.com/postcss/postcss-selector-parser/issues/";

export const KNOWN = [
  {
    property: "sourceIndex points at the node",
    tracking: `${PR}359`,
    note: "a namespaced tag or universal starts at its name instead of its namespace",
    match: (f) => (f.type === "tag" || f.type === "universal") && f.text.includes("|"),
  },
  {
    property: "sourceIndex points at the node",
    tracking: `${ISSUE}357`,
    note: "#189: a comment before a combinator is kept in the combinator's raws",
    match: (f) => f.type === "combinator" && f.text.includes("/*"),
  },
  {
    property: "lossy output is stable",
    tracking: "not filed yet",
    note: "lossy output drops the whitespace before a `|`, so `a |b` becomes `a|b`",
    match: (f) => /\s\|(?!=)|\*\/\|/.test(f.input),
  },
  {
    property: "values set through the API read back the same",
    tracking: `${ISSUE}357`,
    note:
      "in 7.x the constructors and the id value setter write the value as given (see API.md); " +
      "escaping there is parked for the next major (#360, #361)",
    match: (f) =>
      [
        "className constructor",
        "id constructor",
        "id value setter",
        "attribute constructor value",
        "attribute constructor name",
      ].includes(f.case),
  },
  {
    property: "values set through the API read back the same",
    tracking: "not filed yet",
    note: "an attribute namespace of `&` prints as `[&|x]`, which does not parse",
    match: (f) => f.case === "attribute namespace setter" && f.value === "&",
  },
  {
    property: "invalid input throws a parser error",
    tracking: "not filed yet",
    note: "an unclosed `(` at the start or after a pseudo throws a TypeError",
    match: (f) => f.error.startsWith("TypeError") && f.input.includes("("),
  },
];
