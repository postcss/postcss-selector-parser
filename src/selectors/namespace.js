import Node from './node';

export default class Namespace extends Node {
    get namespace () {
        return this._namespace;
    }
    set namespace (namespace) {
        this._namespace = namespace;
        if (this.raws) {
            delete this.raws.namespace;
        }
    }
    get ns () {
        return this._namespace;
    }
    set ns (namespace) {
        this._namespace = namespace;
        if (this.raws) {
            delete this.raws.namespace;
        }
    }

    get namespaceString () {
        if (this.namespace) {
            let ns = this.stringifyProperty("namespace");
            if (ns === true) {
                return '';
            } else {
                return ns;
            }
        } else {
            return '';
        }
    }

    qualifiedName (value) {
        if (this.namespace) {
            return `${this.namespaceString}|${value}`;
        } else {
            return value;
        }
    }

    toString () {
        return [
            this.rawSpaceBefore,
            this.qualifiedName(this.stringifyProperty("value")),
            this.rawSpaceAfter,
        ].join('');
    }
};
