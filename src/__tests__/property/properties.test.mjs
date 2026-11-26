// Property tests: generated selectors and values checked against invariants
// that should hold for any input. They are slower than the example tests and
// run on their own, with `npm run test:property`.
//
//   PROPERTY_RUNS  inputs per property (default 2000)
//   PROPERTY_SEED  seed for the generators (default 1)
//
// A failure prints the offending inputs, so it can be turned into an example
// test directly. Failures that are already understood are listed in
// `known.mjs` with the issue or pull request that tracks them.
import { test } from "node:test";
import assert from "node:assert/strict";
import parser from "../../../dist/index.js";
import { random, grammarSelector, fragmentSelector, anyValue } from "./generate.mjs";
import { KNOWN } from "./known.mjs";

const RUNS = Number(process.env.PROPERTY_RUNS || 2000);
const SEED = Number(process.env.PROPERTY_SEED || 1);

const parse = (input, options) => parser().processSync(input, options);

/**
 * Valid selectors from the grammar generator. They all have to parse, so a
 * parse error here fails the run.
 */
function* selectors() {
  const rng = random(SEED);
  for (let i = 0; i < RUNS; i++) {
    yield grammarSelector(rng);
  }
}

/**
 * Collects failures for one property, sets aside the ones a `KNOWN` entry
 * explains, and fails on the rest.
 */
function check(property, run) {
  test(`${property} (seed ${SEED}, ${RUNS} runs)`, (t) => {
    const known = KNOWN.filter((k) => k.property === property);
    const matched = new Map();
    const unexpected = [];
    run((failure) => {
      const entry = known.find((k) => k.match(failure));
      if (entry) {
        matched.set(entry, (matched.get(entry) || 0) + 1);
      } else {
        unexpected.push(failure);
      }
    });
    for (const entry of known) {
      const count = matched.get(entry);
      t.diagnostic(
        count
          ? `${count} known (${entry.tracking}): ${entry.note}`
          : `known failure no longer seen, remove it from known.mjs: ${entry.note}`,
      );
    }
    assert.deepEqual(unexpected.slice(0, 10), [], `${unexpected.length} unexpected failures`);
  });
}

check("invalid input throws a parser error", (fail) => {
  const rng = random(SEED);
  for (let i = 0; i < RUNS * 4; i++) {
    const input = fragmentSelector(rng);
    try {
      parser().astSync(input);
    } catch (error) {
      // The parser reports its own errors as plain `Error`s; anything else,
      // such as a TypeError, means it crashed instead of rejecting the input.
      if (error.constructor !== Error) {
        fail({ input, error: `${error.name}: ${error.message.split("\n")[0]}` });
      }
    }
  }
});

check("lossless round trip", (fail) => {
  for (const input of selectors()) {
    const output = parse(input);
    if (output !== input) {
      fail({ input, output });
    }
  }
});

check("lossy output is stable", (fail) => {
  for (const input of selectors()) {
    const once = parse(input, { lossless: false });
    let twice;
    try {
      twice = parse(once, { lossless: false });
    } catch (error) {
      twice = `throws: ${error.message.split("\n")[0]}`;
    }
    if (twice !== once) {
      fail({ input, once, twice });
    }
  }
});

check("sourceIndex points at the node", (fail) => {
  for (const input of selectors()) {
    parser()
      .astSync(input)
      .walk((node) => {
        if (node.type === "selector") {
          return;
        }
        const text = node.toString().trim();
        if (text && !input.startsWith(text, node.sourceIndex)) {
          fail({ input, type: node.type, text, sourceIndex: node.sourceIndex });
        }
      });
  }
});

/**
 * Each case stores a value through the public API and returns the value read
 * back after printing and parsing again.
 */
const API_CASES = {
  "className value setter": (value) => {
    const root = parser().astSync(".x");
    root.first.first.value = value;
    return [root.toString(), (s) => parser().astSync(s).first.first.value];
  },
  "className constructor": (value) => [
    parser.className({ value }).toString(),
    (s) => parser().astSync(s).first.first.value,
  ],
  "id value setter": (value) => {
    const root = parser().astSync("#x");
    root.first.first.value = value;
    return [root.toString(), (s) => parser().astSync(s).first.first.value];
  },
  "id constructor": (value) => [
    parser.id({ value }).toString(),
    (s) => parser().astSync(s).first.first.value,
  ],
  "attribute setValue": (value, quoteMark) => {
    const root = parser().astSync("[x=y]");
    root.first.first.setValue(value, { quoteMark });
    return [root.toString(), (s) => parser().astSync(s).first.first.value];
  },
  "attribute constructor value": (value, quoteMark) => [
    parser.attribute({ attribute: "x", operator: "=", value, quoteMark }).toString(),
    (s) => parser().astSync(s).first.first.value,
  ],
  "attribute name setter": (value) => {
    const root = parser().astSync("[x=y]");
    root.first.first.attribute = value;
    return [root.toString(), (s) => parser().astSync(s).first.first.attribute];
  },
  "attribute constructor name": (value) => [
    parser.attribute({ attribute: value }).toString(),
    (s) => parser().astSync(s).first.first.attribute,
  ],
  "tag namespace setter": (value) => {
    const root = parser().astSync("x");
    root.first.first.namespace = value;
    return [root.toString(), (s) => parser().astSync(s).first.first.namespace];
  },
  "attribute namespace setter": (value) => {
    const root = parser().astSync("[x]");
    root.first.first.namespace = value;
    return [root.toString(), (s) => parser().astSync(s).first.first.namespace];
  },
};

check("values set through the API read back the same", (fail) => {
  const rng = random(SEED);
  for (let i = 0; i < RUNS; i++) {
    const value = anyValue(rng);
    const quoteMark = rng.pick(['"', "'", null]);
    for (const [name, run] of Object.entries(API_CASES)) {
      let output;
      let got;
      try {
        let read;
        [output, read] = run(value, quoteMark);
        got = read(output);
      } catch (error) {
        got = `throws: ${error.message.split("\n")[0]}`;
      }
      if (got !== value) {
        fail({ case: name, value, quoteMark, output, got });
      }
    }
  }
});
