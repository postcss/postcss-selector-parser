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

    qualifiedName (value) {
        let qName = [String(value)];
        if (this.namespace) {
            let ns = this.raws && this.raws.namespace || this.namespace;
            if (ns === true) {
                ns = '';
            }
            qName.unshift(ns);
        }
        return qName.join("|");
    }

    toString () {
        return [
            this.spaces.before,
            this.qualifiedName(this.value),
            this.spaces.after,
        ].join('');
    }
};
