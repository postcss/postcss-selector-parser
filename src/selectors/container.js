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
        return this;
    }

    eachAttribute (callback) {
        return this.eachInside((selector) => {
            if (selector.type === 'attribute') {
                return callback.call(this, selector);
            }
        });
    }

    eachClass (callback) {
        return this.eachInside((selector) => {
            if (selector.type === 'class') {
                return callback.call(this, selector);
            }
        });
    }

    eachCombinator (callback) {
        return this.eachInside((selector) => {
            if (selector.type === 'combinator') {
                return callback.call(this, selector);
            }
        });
    }

    eachComment (callback) {
        return this.eachInside((selector) => {
            if (selector.type === 'comment') {
                return callback.call(this, selector);
            }
        });
    }

    eachId (callback) {
        return this.eachInside((selector) => {
            if (selector.type === 'id') {
                return callback.call(this, selector);
            }
        });
    }

    eachPseudo (callback) {
        return this.eachInside((selector) => {
            if (selector.type === 'pseudo') {
                return callback.call(this, selector);
            }
        });
    }

    eachTag (callback) {
        return this.eachInside((selector) => {
            if (selector.type === 'tag') {
                return callback.call(this, selector);
            }
        });
    }

    eachUniversal (callback) {
        return this.eachInside((selector) => {
            if (selector.type === 'universal') {
                return callback.call(this, selector);
            }
        });
    }

    split (callback) {
        let current = [];
        return this.reduce((memo, node, index) => {
            let split = callback.call(this, node);
            current.push(node);
            if (split) {
                memo.push(current);
                current = [];
            } else if (index === this.length - 1) {
                memo.push(current);
            }
            return memo;
        }, []);
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

    filter (callback) {
        return this.nodes.filter(callback);
    }

    toString () {
        return this.map(String).join('');
    }
}
