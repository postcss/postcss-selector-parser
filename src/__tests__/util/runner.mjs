// Minimal ava-compatible shim on top of the built-in node:test runner.
// It lets the existing tests keep their ava-style API (`test(title, fn)`,
// the macro form `test(title, fn, ...args)`, `test.serial/.skip/.only`, and a
// `t` object with `deepEqual`, `is`, `true`, `false`, `truthy`, `falsy`,
// `throws`, `notThrows`, `regex`) without depending on ava.
import { test as nodeTest } from "node:test";
import assert from "node:assert/strict";

function createAssertions() {
  return {
    deepEqual(actual, expected, message) {
      assert.deepEqual(actual, expected, message);
    },
    is(actual, expected, message) {
      assert.strictEqual(actual, expected, message);
    },
    not(actual, expected, message) {
      assert.notStrictEqual(actual, expected, message);
    },
    true(value, message) {
      assert.strictEqual(value, true, message);
    },
    false(value, message) {
      assert.strictEqual(value, false, message);
    },
    truthy(value, message) {
      assert.ok(value, message);
    },
    falsy(value, message) {
      assert.ok(!value, message);
    },
    regex(string, regex, message) {
      assert.match(string, regex, message);
    },
    throws(fn, expectation, message) {
      let caught;
      try {
        fn();
      } catch (err) {
        caught = err;
      }
      assert.ok(caught, message || "Expected the function to throw");
      if (expectation) {
        if (expectation.instanceOf) {
          assert.ok(
            caught instanceof expectation.instanceOf,
            message || `Expected an instance of ${expectation.instanceOf.name}`,
          );
        }
        if (expectation.message !== undefined) {
          if (expectation.message instanceof RegExp) {
            assert.match(caught.message, expectation.message, message);
          } else {
            assert.strictEqual(caught.message, expectation.message, message);
          }
        }
      }
      return caught;
    },
    notThrows(fn) {
      // Re-throws on failure, which node:test reports as a failed test.
      fn();
    },
    pass() {},
    fail(message) {
      assert.fail(message || "Test failed via t.fail()");
    },
  };
}

function makeTest(flags) {
  const fn = (title, implementation, ...args) => {
    const options = {};
    if (flags.skip) {
      options.skip = true;
    }
    if (flags.only) {
      options.only = true;
    }
    // node:test runs tests within a file serially by default, so `serial`
    // needs no special handling.
    const run = () => implementation(createAssertions(), ...args);
    if (Object.keys(options).length > 0) {
      nodeTest(title, options, run);
    } else {
      nodeTest(title, run);
    }
  };

  Object.defineProperty(fn, "skip", { get: () => makeTest({ ...flags, skip: true }) });
  Object.defineProperty(fn, "only", { get: () => makeTest({ ...flags, only: true }) });
  Object.defineProperty(fn, "serial", { get: () => makeTest({ ...flags, serial: true }) });
  Object.defineProperty(fn, "todo", { get: () => makeTest({ ...flags, skip: true }) });

  return fn;
}

const test = makeTest({});

export default test;
