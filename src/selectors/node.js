'use strict';

export default class {
    constructor (opts = {}) {
        for (let key in opts) {
            this[key] = opts[key];
        }
        this.combinator = '';
        this.spaces = {before: '', after: ''};
    }

    removeSelf () {
        if (this.parent) {
            this.parent.remove(this);
        }
        this.parent = undefined;
        return this;
    }

    next () {
        return this.parent.at(this.parent.index(this) + 1);
    }

    prev () {
        return this.parent.at(this.parent.index(this) - 1);
    }

    toString () {
        return [
            String(this.value),
            String(this.combinator || '')
        ].join('');
    }
}
