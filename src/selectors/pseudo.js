'use strict';

import Selector from './selector';
import Parentheses from './parentheses';

export default class Pseudo extends Selector {
    constructor (opts) {
        super(opts);
        this.parameters = new Parentheses();
        this.type = 'pseudo';
    }

    toString () {
        return [
            this.spaces.before,
            String(this.value),
            String(this.parameters),
            this.combinator,
            this.rules.map(String).join(''),
            this.spaces.after
        ].join('');
    }
}
