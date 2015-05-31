'use strict';

import Namespace from './namespace';

export default class Universal extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = 'universal';
    }
}
