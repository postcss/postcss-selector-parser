import cssesc from "cssesc";
import {ensureObject} from '../util';
import Node from './node';
import {CLASS} from './types';

export default class ClassName extends Node {
    constructor (opts) {
        super(opts);
        this.type = CLASS;
        this._constructed = true;
    }

    set value (v) {
        if (this._constructed) {
            let escaped = cssesc(v, {isIdentifier: true});
            if (escaped !== v) {
                ensureObject(this, "raws");
                this.raws.value = escaped;
            } else if (this.raws) {
                delete this.raws.value;
            }
        }
        this._value = v;
    }

    get value () {
        return this._value;
    }

    valueToString () {
        return '.' + super.valueToString();
    }
}
