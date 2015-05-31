'use strict';

import Namespace from './namespace';

export default class ClassName extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = 'class';
    }

    toString () {
        return [
            this.spaces.before,
            this.ns,
            String('.' + this.value),
            this.combinator,
            this.spaces.after
        ].join('');
    }
}
