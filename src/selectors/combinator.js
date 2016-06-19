import Node from './node';
import {COMBINATOR} from './types';

export default class Combinator extends Node {
    constructor (opts) {
        super(opts);
        this.type = COMBINATOR;
    }
}
