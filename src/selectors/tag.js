'use strict';

import Node from './node';

export default class Tag extends Node {
    constructor (opts) {
        super(opts);
        this.type = 'tag';
    }
}
