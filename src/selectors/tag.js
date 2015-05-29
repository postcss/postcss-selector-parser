'use strict';

import Selector from './selector';

export default class Tag extends Selector {
    constructor (opts) {
        super(opts);
        this.type = 'tag';
    }
}
