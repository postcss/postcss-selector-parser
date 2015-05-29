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
        let namespace = this.namespace ? (typeof this.namespace === 'string' ? this.namespace : '') + '|' : '';
        return [
            this.spaces.before,
            namespace,
            String(this.value),
            this.combinator,
            this.rules.map(String).join(''),
            this.spaces.after
        ].join('');
    }
}
