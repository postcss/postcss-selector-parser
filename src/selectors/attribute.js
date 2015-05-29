'use strict';

import Selector from './selector';

export default class Attribute extends Selector {
    constructor (opts) {
        super(opts);
        this.insensitive = opts.insensitive;
        this.attribute = opts.attribute;
        this.operator = opts.operator;
        this.namespace = opts.namespace;
        this.type = 'attribute';
        this.raw = {};
    }

    toString () {
        let namespace = this.namespace ? (typeof this.namespace === 'string' ? this.namespace : '') + '|' : '';
        let selector = [
            this.spaces.before,
            '[',
            namespace,
            this.attribute,
        ];

        if (this.operator) { selector.push(this.operator); }
        if (this.value) { selector.push(this.value); }
        if (this.raw.insensitive) {
            selector.push(this.raw.insensitive);
        } else if (this.insensitive) {
            selector.push(' i');
        }
        selector.push(']' + this.combinator);
        selector.push(this.rules.map(String).join(''));
        return selector.concat(this.spaces.after).join('');
    }
}
