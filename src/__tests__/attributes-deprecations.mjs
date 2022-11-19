import attribute from '../selectors/attribute.js';
import {test} from './util/helpers.mjs';
const Attribute = attribute.default;

// DeprecationWarnings are throw higher in the stack since Node 16.
// These can no longer be caught.
test.skip('deprecated constructor', '', (t) => {
    t.throws(
        () => {
            return new Attribute({value: '"foo"', attribute: "data-bar"});
        },
        {message: "Constructing an Attribute selector with a value without specifying quoteMark is deprecated. Note: The value should be unescaped now."}
    );
});

test.skip('deprecated get of raws.unquoted ', '', (t) => {
    t.throws(
        () => {
            let attr = new Attribute({value: 'foo', quoteMark: '"', attribute: "data-bar"});
            return attr.raws.unquoted;
        },
        {message: "attr.raws.unquoted is deprecated. Call attr.value instead."}
    );
});

test.skip('deprecated set of raws.unquoted ', '', (t) => {
    t.throws(
        () => {
            let attr = new Attribute({value: 'foo', quoteMark: '"', attribute: "data-bar"});
            attr.raws.unquoted = 'fooooo';
        },
        {message: "Setting attr.raws.unquoted is deprecated and has no effect. attr.value is unescaped by default now."}
    );
});
