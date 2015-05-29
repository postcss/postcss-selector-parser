'use strict';

import Tag from './tag';

export default class Universal extends Tag {
    constructor (opts) {
        super(opts);
        this.type = 'universal';
    }
}
