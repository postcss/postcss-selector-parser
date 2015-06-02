'use strict';

import Namespace from './namespace';

export default class Attribute extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = 'attribute';
        this.raw = {};
    }

    toString () {
        let selector = [
            this.spaces.before,
            '[',
            this.ns,
            this.attribute
        ];

        if (this.operator) { selector.push(this.operator); }
        if (this.value) { selector.push(this.value); }
        if (this.raw.insensitive) {
            selector.push(this.raw.insensitive);
        } else if (this.insensitive) {
            selector.push(' i');
        }
        selector.push(']');
        return selector.concat(this.spaces.after).join('');
    }
}
