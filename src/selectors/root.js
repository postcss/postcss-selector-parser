'use strict';

export default class Root {
    constructor () {
        this.type = 'root';
        this.selectors = [];
        this.spaces = {before: '', after: ''};
    }

    append (selector) {
        selector.parent = this;
        this.selectors.push(selector);
        return this;
    }

    each (callback) {
        this.selectors.forEach(callback);
        return this;
    }

    toString () {
        return [
            this.spaces.before,
            this.selectors.map(String).join(','),
            this.spaces.after
        ].join('');
    }
}
