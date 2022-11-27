import attribute from '../selectors/attribute.js';
import {test} from './util/helpers.mjs';
const Attribute = attribute.default;

function waitForWarning() {
    return new Promise((resolve) => {
        process.once('warning', (err) => {
            resolve(err);
        });
    });
}

test.serial('deprecated constructor', '', (t) => {
    const warningWaiter = waitForWarning();

    new Attribute({ value: '"foo"', attribute: "data-bar" });

    return warningWaiter.then((warning) => {
        t.deepEqual(warning.message, "Constructing an Attribute selector with a value without specifying quoteMark is deprecated. Note: The value should be unescaped now.");
    });
});

test.serial('deprecated get of raws.unquoted ', '', (t) => {
    const warningWaiter = waitForWarning();

    let attr = new Attribute({ value: 'foo', quoteMark: '"', attribute: "data-bar" });
    attr.raws.unquoted;

    return warningWaiter.then((warning) => {
        t.deepEqual(warning.message, "attr.raws.unquoted is deprecated. Call attr.value instead.");
    });
});

test.serial('deprecated set of raws.unquoted ', '', (t) => {
    const warningWaiter = waitForWarning();

    let attr = new Attribute({ value: 'foo', quoteMark: '"', attribute: "data-bar" });
    attr.raws.unquoted = 'fooooo';

    return warningWaiter.then((warning) => {
        t.deepEqual(warning.message, "Setting attr.raws.unquoted is deprecated and has no effect. attr.value is unescaped by default now.");
    });
});
