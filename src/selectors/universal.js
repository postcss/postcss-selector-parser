'use strict';

import Node from './node';

export default class Universal extends Node {
    constructor (opts) {
        super(opts);
        this.type = 'universal';
    }
}
