'use strict';

import Selector from './selector';

export default class Comment extends Selector {
    constructor (opts) {
        super(opts);
        this.type = 'comment';
    }
}
