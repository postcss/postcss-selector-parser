'use strict';

import Container from './container';

export default class Root extends Container {
    constructor (opts) {
        super(opts);
        this.type = 'root';
    }

    toString () {
        return this.reduce((memo, selector) => {
            let str = String(selector);
            return str ? memo + str + ',' : '';
        }, '').slice(0, -1);
    }
}
