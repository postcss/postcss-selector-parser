import Node from './node';
import {NESTING} from './types';

export default class Nesting extends Node {
    constructor (opts) {
        super(opts);
        this.type = NESTING;
        this.value = '&';
    }
}
