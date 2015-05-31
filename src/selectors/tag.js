'use strict';

import Namespace from './namespace';

export default class Tag extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = 'tag';
    }
}
