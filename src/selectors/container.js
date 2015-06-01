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

    at (index) {
        return this.nodes[index];
    }

    index (child) {
        if (typeof child === 'number') {
            return child;
        }
        return this.nodes.indexOf(child);
    }

    get first () {
        return this.at(0);
    }

    get last () {
        return this.at(this.nodes.length - 1);
    }

    remove (child) {
        child = this.index(child);
        this.nodes[child].parent = undefined;
        this.nodes.splice(child, 1);

        return this;
    }

    removeAll () {
        let child;
        while (child = this.index(0)) {
            child.removeSelf();
        }
        return this;
    }

    empty () {
        return this.removeAll();
    }

    each (callback) {
        this.nodes.forEach(callback);
        return this;
    }

    every (callback) {
        return this.nodes.every(callback);
    }

    some (callback) {
        return this.nodes.some(callback);
    }

    toString () {
        return [
            this.spaces.before,
            this.nodes.map(String).join(''),
            this.spaces.after
        ].join('');
    }
}
