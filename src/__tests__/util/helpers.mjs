import process from "process";
import util from "util";
import ava from "./runner.mjs";
import parser from "../../../dist/index.js";

export const parse = (input, transform) => {
  return parser(transform).processSync(input);
};

export function test(spec, input, callback, only = false, disabled = false, serial = false) {
  let tester = only ? ava.only : ava;
  tester = disabled ? tester.skip : tester;
  tester = serial ? tester.serial : tester;

  if (callback) {
    tester(`${spec} (tree)`, (t) => {
      let tree = parser().astSync(input);
      let debug = util.inspect(tree, false, null);
      return callback.call(this, t, tree, debug);
    });
  }

  tester(`${spec} (toString)`, (t) => {
    let result = parser().processSync(input);
    t.deepEqual(result, input);
  });
}

test.only = (spec, input, callback) => test(spec, input, callback, true);
test.skip = (spec, input, callback) => test(spec, input, callback, false, true);
test.serial = (spec, input, callback) => test(spec, input, callback, false, false, true);

export const throws = (spec, input, validator) => {
  ava(`${spec} (throws)`, (t) => {
    t.throws(
      () => parser().processSync(input),
      validator ? { message: validator } : { instanceOf: Error },
    );
  });
};

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) {
      return 1;
    }
    if (na < nb) {
      return -1;
    }
  }
  return 0;
}

export function nodeVersionAtLeast(version) {
  return compareVersions(process.versions.node, version) >= 0;
}

export function nodeVersionBefore(version) {
  return compareVersions(process.versions.node, version) < 0;
}
