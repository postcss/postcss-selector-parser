import Namespace from './namespace';
import {ID as IDType} from './types';

export default class ID extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = IDType;
    }

    toString () {
        return [
            this.spaces.before,
            this.ns,
            String('#' + this.value),
            this.spaces.after
        ].join('');
    }
}
