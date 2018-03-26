import Node from './node';
import {CLASS} from './types';

export default class ClassName extends Node {
    constructor (opts) {
        super(opts);
        this.type = CLASS;
    }

    toString () {
        return [
            this.spaces.before,
            String('.' + this.value),
            this.spaces.after,
        ].join('');
    }
}
