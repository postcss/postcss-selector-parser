'use strict';

import Namespace from './namespace';

export default class ID extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = 'id';
    }

    toString () {
        return [
            this.spaces.before,
            this.ns,
            String('#' + this.value),
            this.spaces.after
        ].join('');
    }
}
