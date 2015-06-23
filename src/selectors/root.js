'use strict';

import Container from './container';

export default class Root extends Container {
    constructor (opts) {
        super(opts);
        this.type = 'root';
    }

    toString () {
        let str = this.reduce((memo, selector) => {
            let str = String(selector);
            return str ? memo + str + ',' : '';
        }, '').slice(0, -1);
        return this.trailingComma ? str + ',' : str;
    }
}
