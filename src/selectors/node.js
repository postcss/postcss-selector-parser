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
        let namespace = this.namespace ? (typeof this.namespace === 'string' ? this.namespace : '') + '|' : '';
        return [
            namespace,
            String(this.value),
            String(this.combinator || '')
        ].join('');
    }
}
