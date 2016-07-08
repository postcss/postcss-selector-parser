import Namespace from './namespace';
import {CLASS} from './types';

export default class ClassName extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = CLASS;
    }

    toString () {
        return [
            this.spaces.before,
            this.ns,
            String('.' + this.value),
            this.spaces.after,
        ].join('');
    }
}
