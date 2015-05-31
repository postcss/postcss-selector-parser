'use strict';

import Container from './container';

export default class Pseudo extends Container {
    constructor (opts) {
        super(opts);
        this.type = 'pseudo';
    }

    toString () {
        let params = this.nodes.length ? '(' + this.nodes.map(String).join(',') + ')' : '';
        return [
            this.spaces.before,
            String(this.value),
            params,
            this.combinator,
            this.spaces.after
        ].join('');
    }
}
