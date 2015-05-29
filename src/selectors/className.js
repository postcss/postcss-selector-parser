'use strict';

import Selector from './selector';

export default class ClassName extends Selector {
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
            this.rules.map(String).join(''),
            this.spaces.after
        ].join('');
    }
}
