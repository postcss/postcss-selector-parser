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

    toString () {
        let ns = this.ns || '';
        return [
            ns,
            String(this.value),
            String(this.combinator || '')
        ].join('');
    }
}
