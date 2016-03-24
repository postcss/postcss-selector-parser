#!/usr/bin/env node

var glob = require('glob');
var spawn = require('child_process').spawn;
var files = require('minimist')(process.argv.slice(2))._[0];

function spawnAva (file) {
    return new Promise(function (resolve, reject) {
        var ps = spawn(process.execPath, ['node_modules/.bin/ava', file]);

        ps.stdout.pipe(process.stdout);
        ps.stderr.pipe(process.stderr);

        ps.on('close', function (code) {
            if (code === 0) {
                return resolve(code);
            }
            return reject(code);
        });
    });
}

glob(files, function (err, tests) {
    if (err) {
        throw err;
    }
    return tests.reduce(function (promise, file) {
        return promise.then(function () { return spawnAva(file); });
    }, Promise.resolve());
});
