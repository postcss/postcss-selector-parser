import Node from './node';
import {STRING} from './types';

export default class String extends Node {
    constructor (opts) {
        super(opts);
        this.type = STRING;
    }
}
