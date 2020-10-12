import process from 'process';
import util from 'util';
import ava from 'ava';
import semver from 'semver';
import parser from '../../index';

export const parse = (input, transform) => {
    return parser(transform).processSync(input);
};

export function test (spec, input, callback, only = false, disabled = false, serial = false) {
    let tester = only ? ava.only : ava;
    tester = disabled ? tester.skip : tester;
    tester = serial ? tester.serial : tester;

    if (callback) {
        tester(`${spec} (tree)`, t => {
            let tree = parser().astSync(input);
            let debug = util.inspect(tree, false, null);
            return callback.call(this, t, tree, debug);
        });
    }

    tester(`${spec} (toString)`, t => {
        let result = parser().processSync(input);
        t.deepEqual(result, input);
    });
}

test.only = (spec, input, callback) => test(spec, input, callback, true);
test.skip = (spec, input, callback) => test(spec, input, callback, false, true);
test.serial = (spec, input, callback) => test(spec, input, callback, false, false, true);

export const throws = (spec, input, validator) => {
    ava(`${spec} (throws)`, t => {
        t.throws(() => parser().processSync(input), validator ? {message: validator} : {instanceOf: Error});
    });
};

export function nodeVersionAtLeast (version) {
    return semver.gte(process.versions.node, version);
}

export function nodeVersionBefore (version) {
    return semver.lt(process.versions.node, version);
}
