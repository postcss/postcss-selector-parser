import Node from './node';
import * as types from './types';

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
        for ( let id in this.indexes ) {
            this.indexes[id]++;
        }
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
        newNode.parent = this;
        let oldIndex = this.index(oldNode);
        this.nodes.splice(oldIndex + 1, 0, newNode);

        newNode.parent = this;

        let index;
        for ( let id in this.indexes ) {
            index = this.indexes[id];
            if ( oldIndex < index ) {
                this.indexes[id] = index + 1;
            }
        }

        return this;
    }

    insertBefore (oldNode, newNode) {
        newNode.parent = this;
        let oldIndex = this.index(oldNode);
        this.nodes.splice(oldIndex, 0, newNode);

        newNode.parent = this;

        let index;
        for ( let id in this.indexes ) {
            index = this.indexes[id];
            if ( index >= oldIndex ) {
                this.indexes[id] = index + 1;
            }
        }

        return this;
    }

    _findChildAtPosition (line, col) {
        let found = undefined;
        this.each(node => {
            if (node.atPosition) {
                let foundChild = node.atPosition(line, col);
                if (foundChild) {
                    found = foundChild;
                    return false;
                }
            } else if (node.isAtPosition(line, col)) {
                found = node;
                return false;
            }
        });
        return found;
    }

    /**
     * Return the most specific node at the line and column number given.
     * The source location is based on the original parsed location, locations aren't
     * updated as selector nodes are mutated.
     * 
     * Note that this location is relative to the location of the first character
     * of the selector, and not the location of the selector in the overall document
     * when used in conjunction with postcss.
     *
     * If not found, returns undefined.
     * @param {number} line The line number of the node to find. (1-based index)
     * @param {number} col  The column number of the node to find. (1-based index)
     */
    atPosition (line, col) {
        if (this.isAtPosition(line, col)) {
            return this._findChildAtPosition(line, col) || this;
        } else {
            return undefined;
        }
    }

    _inferEndPosition () {
        if (this.last && this.last.source && this.last.source.end) {
            this.source = this.source || {};
            this.source.end = this.source.end || {};
            Object.assign(this.source.end, this.last.source.end);
        }
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
            if (selector.type === types.ATTRIBUTE) {
                return callback.call(this, selector);
            }
        });
    }

    walkClasses (callback) {
        return this.walk((selector) => {
            if (selector.type === types.CLASS) {
                return callback.call(this, selector);
            }
        });
    }

    walkCombinators (callback) {
        return this.walk((selector) => {
            if (selector.type === types.COMBINATOR) {
                return callback.call(this, selector);
            }
        });
    }

    walkComments (callback) {
        return this.walk((selector) => {
            if (selector.type === types.COMMENT) {
                return callback.call(this, selector);
            }
        });
    }

    walkIds (callback) {
        return this.walk((selector) => {
            if (selector.type === types.ID) {
                return callback.call(this, selector);
            }
        });
    }

    walkNesting (callback) {
        return this.walk(selector => {
            if (selector.type === types.NESTING) {
                return callback.call(this, selector);
            }
        });
    }

    walkPseudos (callback) {
        return this.walk((selector) => {
            if (selector.type === types.PSEUDO) {
                return callback.call(this, selector);
            }
        });
    }

    walkTags (callback) {
        return this.walk((selector) => {
            if (selector.type === types.TAG) {
                return callback.call(this, selector);
            }
        });
    }

    walkUniversals (callback) {
        return this.walk((selector) => {
            if (selector.type === types.UNIVERSAL) {
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
