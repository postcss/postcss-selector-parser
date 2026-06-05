import Container, {toStringIterative} from './container';
import {PSEUDO} from './types';

export default class Pseudo extends Container {
    constructor (opts) {
        super(opts);
        this.type = PSEUDO;
    }

    toString () {
        return toStringIterative(this);
    }
}
