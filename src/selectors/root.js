import Container, {toStringIterative} from './container';
import {ROOT} from './types';

export default class Root extends Container {
    constructor (opts) {
        super(opts);
        this.type = ROOT;
    }

    toString () {
        return toStringIterative(this);
    }

    error (message, options) {
        if (this._error) {
            return this._error(message, options);
        } else {
            return new Error(message);
        }
    }

    set errorGenerator (handler) {
        this._error = handler;
    }
}
