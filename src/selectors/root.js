import Container from './container';
import {ROOT} from './types';

export default class Root extends Container {
    constructor (opts) {
        super(opts);
        this.type = ROOT;
    }

    toString () {
        let str = this.reduce((memo, selector) => {
            let sel = String(selector);
            return sel ? memo + sel + ',' : '';
        }, '').slice(0, -1);
        return this.trailingComma ? str + ',' : str;
    }
}
