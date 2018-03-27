import Container from './container';
import {ROOT} from './types';

export default class Root extends Container {
    constructor (opts) {
        super(opts);
        this.type = ROOT;
    }

    toString () {
        let str = this.reduce((memo, selector) => {
            memo.push(String(selector));
            return memo;
        }, []).join(',');
        return this.trailingComma ? str + ',' : str;
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
