'use strict';

export default class {
    constructor (opts = {}) {
        for (let key in opts) {
            this[key] = opts[key];
        }
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
            this.spaces.before,
            String(this.value),
            this.spaces.after
        ].join('');
    }
}
