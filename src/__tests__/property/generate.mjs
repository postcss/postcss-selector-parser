// Seeded generators for the property tests. Everything here is deterministic
// for a given seed, so a failure can be replayed exactly.

/**
 * mulberry32, a small seedable PRNG.
 * @param {number} seed
 */
export function random(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (n) => Math.floor(next() * n),
    chance: (p) => next() < p,
    pick: (list) => list[Math.floor(next() * list.length)],
  };
}

const IDENTS = ["a", "div", "foo-bar", "_x", "x1", "é", "\\31 a", "a\\:b", "a\\ b", "--v"];
const VALUES = ["v", "foo-bar", '"x y"', "'x y'", '"a\\"b"', "'it\\'s'", '""', "a\\ b"];
const OPERATORS = ["=", "~=", "|=", "^=", "$=", "*="];
const PSEUDOS = [":hover", "::before", ":first-child", ":nth-child(2n+1)", "::slotted(a)"];
const COMBINATORS = [" ", " > ", ">", " + ", "+", " ~ ", "~"];
const NAMESPACES = ["ns|", "*|", "|"];

/**
 * A selector list built from the grammar: compounds that start with an
 * optional type or universal selector, then classes, ids, attributes and
 * pseudos, joined by combinators, comments and commas. Spacing varies so the
 * lossless paths get exercised.
 */
export function grammarSelector(rng, depth = 0) {
  const sp = () => rng.pick(["", "", "", " ", "  ", "\n"]);
  const ns = () => (rng.chance(0.2) ? rng.pick(NAMESPACES) : "");

  const attribute = () => {
    let s = "[" + sp() + ns() + rng.pick(IDENTS) + sp();
    if (rng.chance(0.7)) {
      s += rng.pick(OPERATORS) + sp() + rng.pick(VALUES) + sp();
      if (rng.chance(0.2)) {
        s += rng.pick(["i", "s", "I"]) + sp();
      }
    }
    return s + "]";
  };

  const pseudo = () => {
    if (depth < 2 && rng.chance(0.2)) {
      return (
        rng.pick([":not(", ":is(", ":where(", ":has("]) + grammarSelector(rng, depth + 1) + ")"
      );
    }
    return rng.pick(PSEUDOS);
  };

  const compound = () => {
    let s = "";
    if (rng.chance(0.1)) {
      s += "&";
    } else if (rng.chance(0.6)) {
      s += ns() + (rng.chance(0.2) ? "*" : rng.pick(IDENTS));
    }
    const parts = s ? rng.int(3) : 1 + rng.int(3);
    for (let i = 0; i < parts; i++) {
      s += rng.pick([
        () => "." + rng.pick(IDENTS),
        () => "#" + rng.pick(IDENTS),
        attribute,
        pseudo,
      ])();
    }
    return s;
  };

  const complex = () => {
    let s = compound();
    const n = rng.int(3);
    for (let i = 0; i < n; i++) {
      if (rng.chance(0.1)) {
        s += " /*c*/";
      }
      s += rng.pick(COMBINATORS) + compound();
    }
    return s;
  };

  let s = sp() + complex();
  const n = rng.int(3);
  for (let i = 0; i < n; i++) {
    s += rng.pick([",", ", ", " , "]) + sp() + complex();
  }
  return s + sp();
}

const FRAGMENTS = [
  ...IDENTS,
  "*",
  "|",
  "ns|a",
  "*|*",
  ".c",
  "#i",
  "[x]",
  "[x=y]",
  '[x="y z"]',
  ":hover",
  "::before",
  ":not(.a, .b)",
  ":is( a , b )",
  "&",
  " ",
  "\n",
  " > ",
  "+",
  "~",
  ",",
  "/*c*/",
  "\\",
  "\\\\",
  "#{$x}",
  "@{v}",
  "(",
  ")",
  "[",
  "]",
  ":",
  '"',
  "'",
];

/**
 * Fragments concatenated with no grammar at all. Most results do not parse
 * and are skipped; the ones that do reach parser paths the grammar never
 * produces, such as a `|` straight after a pseudo.
 */
export function fragmentSelector(rng) {
  let s = "";
  const n = 1 + rng.int(6);
  for (let i = 0; i < n; i++) {
    s += rng.pick(FRAGMENTS);
  }
  return s;
}

const CHARS = [
  ..."abZ09-_.#:[]()\"'\\ \n\t*|$=~^>+,/{}@%!&;",
  "é",
  "\u{1F600}",
  "\u0001",
  "\u007f",
  " ",
];

/**
 * An arbitrary value for the setters and constructors. NUL and lone
 * surrogates are left out: CSS has no way to spell them, so they come back
 * as U+FFFD by design.
 */
export function anyValue(rng) {
  let s = "";
  const n = 1 + rng.int(6);
  for (let i = 0; i < n; i++) {
    s += rng.pick(CHARS);
  }
  return s;
}
