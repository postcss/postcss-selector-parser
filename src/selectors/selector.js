'use strict';

import Selectors from './selectors';

export default class Selector extends Selectors {
    constructor (opts) {
        super(opts);
        this.type = 'selector';
        this.value = opts.value;
        this.combinator = '';
    }

    toString () {
        return [
            this.spaces.before,
            String(this.value),
            this.combinator,
            this.rules.map(String).join(''),
            this.spaces.after
        ].join('');
    }
}
