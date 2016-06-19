import Container from './container';
import {PSEUDO} from './types';

export default class Pseudo extends Container {
    constructor (opts) {
        super(opts);
        this.type = PSEUDO;
    }

    toString () {
        let params = this.length ? '(' + this.map(String).join(',') + ')' : '';
        return [
            this.spaces.before,
            String(this.value),
            params,
            this.spaces.after
        ].join('');
    }
}
