'use strict';

import Container from './container';

export default class Root extends Container {
    constructor (opts) {
        super(opts);
        this.type = 'root';
    }

    toString () {
        return [
            this.spaces.before,
            this.nodes.map(String).join(','),
            this.spaces.after
        ].join('');
    }
}
