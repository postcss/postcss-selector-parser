'use strict';

import Node from './node';

export default class ClassName extends Node {
    constructor (opts) {
        super(opts);
        this.type = 'class';
    }

    toString () {
        let namespace = this.namespace ? (typeof this.namespace === 'string' ? this.namespace : '') + '|' : '';
        return [
            this.spaces.before,
            namespace,
            String('.' + this.value),
            this.combinator,
            this.spaces.after
        ].join('');
    }
}
