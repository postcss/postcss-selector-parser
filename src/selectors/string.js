'use strict';

import Node from './node';

export default class String extends Node {
    constructor (opts) {
        super(opts);
        this.type = 'string';
    }
}
