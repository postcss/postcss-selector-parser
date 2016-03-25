#!/usr/bin/env node

var glob = require('glob');
var spawn = require('child_process').spawn;
var files = require('minimist')(process.argv.slice(2))._[0];

function throttlePromise (myArray, iterator, limit) {
    var pickUpNextTask = function () {
        if (myArray.length) {
            return iterator(myArray.shift());
        }
    };
  
    function startChain () {
        return Promise.resolve().then(function next () {
            return pickUpNextTask().then(next);
        });
    }

    var chains = [];
    for (var k = 0; k < limit; k += 1) {
        chains.push(startChain());
    }
    return Promise.all(chains);
};

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
    return throttlePromise(tests, spawnAva, 2);
});
