'use strict';

import Selector from './selector';

export default class ClassName extends Selector {
    constructor (opts) {
        super(opts);
        this.type = 'class';
    }

    toString () {
        return [
            this.spaces.before,
            String('.' + this.value),
            this.combinator,
            this.rules.map(String).join(''),
            this.spaces.after
        ].join('');
    }
}
