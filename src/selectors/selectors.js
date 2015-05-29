'use strict';

export default class Selectors {
    constructor () {
        this.type = 'selectors';
        this.rules = [];
        this.spaces = {before: '', after: ''};
    }

    append (selector) {
        selector.parent = this;
        this.rules.push(selector);
        return this;
    }

    each (callback) {
        this.rules.forEach(callback);
        return this;
    }

    toString () {
        return [
            this.spaces.before,
            this.rules.map(String).join(''),
            this.spaces.after
        ].join('');
    }
}
