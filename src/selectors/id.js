import Node from './node';
import {ID as IDType} from './types';

export default class ID extends Node {
    constructor (opts) {
        super(opts);
        this.type = IDType;
    }

    valueToString () {
        return '#' + super.valueToString();
    }
}
