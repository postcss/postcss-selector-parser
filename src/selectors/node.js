'use strict';

let cloneNode = function (obj, parent) {
    if (typeof obj !== 'object') {
        return obj;
    }

    let cloned = new obj.constructor();

    for ( let i in obj ) {
        if ( !obj.hasOwnProperty(i) ) { continue; }
        let value = obj[i];
        let type  = typeof value;

        if ( i === 'parent' && type === 'object' ) {
            if (parent) { cloned[i] = parent; }
        } else if ( value instanceof Array ) {
            cloned[i] = value.map( j => cloneNode(j, cloned) );
        } else {
            cloned[i] = cloneNode(value, cloned);
        }
    }

    return cloned;
};

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

    replaceWith () {
        if (this.parent) {
            for (let index in arguments) {
                this.parent.insertBefore(this, arguments[index]);
            }
            this.removeSelf();
        }
        return this;
    }

    next () {
        return this.parent.at(this.parent.index(this) + 1);
    }

    prev () {
        return this.parent.at(this.parent.index(this) - 1);
    }

    clone(overrides = {}) {
        let cloned = cloneNode(this);
        for (let name in overrides) {
            cloned[name] = overrides[name];
        }
        return cloned;
    }

    toString () {
        return [
            this.spaces.before,
            String(this.value),
            this.spaces.after
        ].join('');
    }
}
