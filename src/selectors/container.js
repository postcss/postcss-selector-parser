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
        return this.at(this.length - 1);
    }

    get length () {
        return this.nodes.length;
    }

    remove (child) {
        child = this.index(child);
        this.at(child).parent = undefined;
        this.nodes.splice(child, 1);

        return this;
    }

    removeAll () {
        for (let node of this.nodes) node.parent = undefined;
        this.nodes = [];
        return this;
    }

    empty () {
        return this.removeAll();
    }

    each (callback) {
        this.nodes.forEach(callback);
        return this;
    }

    eachInside (callback) {
        this.nodes.forEach((node) => {
            callback(node);
            if (node.length) {
                return node.eachInside(callback);
            }
        });
    }

    map (callback) {
        return this.nodes.map(callback);
    }

    reduce (callback, memo) {
        return this.nodes.reduce(callback, memo);
    }

    every (callback) {
        return this.nodes.every(callback);
    }

    some (callback) {
        return this.nodes.some(callback);
    }

    toString () {
        return this.map(String).join('');
    }
}
