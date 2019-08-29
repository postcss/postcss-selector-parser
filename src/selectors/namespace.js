import cssesc from 'cssesc';
import {ensureObject} from '../util';
import Node from './node';

export default class Namespace extends Node {
    get namespace () {
        return this._namespace;
    }
    set namespace (namespace) {
        if (namespace === true || namespace === "*" || namespace === "&") {
            this._namespace = namespace;
            if (this.raws) {
                delete this.raws.namespace;
            }
            return;
        }

        let escaped = cssesc(namespace, {isIdentifier: true});
        this._namespace = namespace;
        if (escaped !== namespace) {
            ensureObject(this, "raws");
            this.raws.namespace = escaped;
        } else if (this.raws) {
            delete this.raws.namespace;
        }
    }
    get ns () {
        return this._namespace;
    }
    set ns (namespace) {
        this.namespace = namespace;
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

    valueToString () {
        return this.qualifiedName(super.valueToString());
    }
};
