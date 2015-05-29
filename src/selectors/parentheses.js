'use strict';

import Root from './root';

export default class Parentheses extends Root {
    constructor () {
        super();
        this.type = 'parentheses';
    }

    toString () {
        if (!this.selectors.length) {
            return '';
        }

        return [
            this.spaces.before,
            '(',
            this.selectors.map(String).join(','),
            ')',
            this.spaces.after
        ].join('');
    }
}
