'use strict';

import Container from './container';

export default class Selector extends Container {
    constructor (opts) {
        super(opts);
        this.type = 'selector';
    }
}
