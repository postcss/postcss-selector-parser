'use strict';

import Node from './node';

export default class Container extends Node {
    constructor (opts) {
        super(opts);
        if (!this.nodes) {
            this.nodes = [];
        }
    }

    append (selector) {
        selector.parent = this;
        this.nodes.push(selector);
        return this;
    }

    prepend (selector) {
        selector.parent = this;
        this.nodes.unshift(selector);
        return this;
    }

    at (child) {
        if (typeof child === 'number') {
            return child;
        }
        return this.nodes.indexOf(child);
    }

    index (child) {
        return at(child);
    }

    remove (child) {
        child = this.at(child);
        this.nodes[child].parent = undefined;
        this.nodes.splice(child, 1);

        return this;
    }

    removeAll () {
        let child;
        while (child = this.at(0)) {
            child.removeSelf();
        }
        return this;
    }

    each (callback) {
        this.nodes.forEach(callback);
        return this;
    }

    toString () {
        return [
            this.spaces.before,
            this.nodes.map(String).join(''),
            this.spaces.after
        ].join('');
    }
}
