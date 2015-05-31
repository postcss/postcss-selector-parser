'use strict';

import Node from './node';

export default class Attribute extends Node {
    constructor (opts) {
        super(opts);
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
        return selector.concat(this.spaces.after).join('');
    }
}
