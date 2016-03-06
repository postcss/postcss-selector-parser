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

    removeChild (child) {
        child = this.index(child);
        this.at(child).parent = undefined;
        this.nodes.splice(child, 1);

        let index;
        for ( let id in this.indexes ) {
            index = this.indexes[id];
            if ( index >= child ) {
                this.indexes[id] = index - 1;
            }
        }

        return this;
    }

    removeAll () {
        for (let node of this.nodes) {
            node.parent = undefined;
        }
        this.nodes = [];
        return this;
    }

    empty () {
        return this.removeAll();
    }

    insertAfter (oldNode, newNode) {
        let oldIndex = this.index(oldNode);
        this.nodes.splice(oldIndex + 1, 0, newNode);

        let index;
        for ( let id in this.indexes ) {
            index = this.indexes[id];
            if ( oldIndex <= index ) {
                this.indexes[id] = index + this.nodes.length;
            }
        }

        return this;
    }

    insertBefore (oldNode, newNode) {
        let oldIndex = this.index(oldNode);
        this.nodes.splice(oldIndex, 0, newNode);

        let index;
        for ( let id in this.indexes ) {
            index = this.indexes[id];
            if ( oldIndex <= index ) {
                this.indexes[id] = index + this.nodes.length;
            }
        }

        return this;
    }

    each (callback) {
        if (!this.lastEach) {
            this.lastEach = 0;
        }
        if (!this.indexes) {
            this.indexes = {};
        }

        this.lastEach ++;
        let id = this.lastEach;
        this.indexes[id] = 0;

        if (!this.length) {
            return undefined;
        }

        let index, result;
        while (this.indexes[id] < this.length) {
            index = this.indexes[id];
            result = callback(this.at(index), index);
            if (result === false) {
                break;
            }

            this.indexes[id] += 1;
        }

        delete this.indexes[id];

        if (result === false) {
            return false;
        }
    }

    walk (callback) {
        return this.each((node, i) => {
            let result = callback(node, i);

            if (result !== false && node.length) {
                result = node.walk(callback);
            }

            if (result === false) {
                return false;
            }
        });
    }

    walkAttributes (callback) {
        return this.walk((selector) => {
            if (selector.type === 'attribute') {
                return callback.call(this, selector);
            }
        });
    }

    walkClasses (callback) {
        return this.walk((selector) => {
            if (selector.type === 'class') {
                return callback.call(this, selector);
            }
        });
    }

    walkCombinators (callback) {
        return this.walk((selector) => {
            if (selector.type === 'combinator') {
                return callback.call(this, selector);
            }
        });
    }

    walkComments (callback) {
        return this.walk((selector) => {
            if (selector.type === 'comment') {
                return callback.call(this, selector);
            }
        });
    }

    walkIds (callback) {
        return this.walk((selector) => {
            if (selector.type === 'id') {
                return callback.call(this, selector);
            }
        });
    }
    
    walkNesting (callback) {
        return this.walk(selector => {
            if (selector.type === 'nesting') {
                return callback.call(this, selector);
            }
        });
    }

    walkPseudos (callback) {
        return this.walk((selector) => {
            if (selector.type === 'pseudo') {
                return callback.call(this, selector);
            }
        });
    }

    walkTags (callback) {
        return this.walk((selector) => {
            if (selector.type === 'tag') {
                return callback.call(this, selector);
            }
        });
    }

    walkUniversals (callback) {
        return this.walk((selector) => {
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

    sort (callback) {
        return this.nodes.sort(callback);
    }

    toString () {
        return this.map(String).join('');
    }
}
