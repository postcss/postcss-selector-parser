import Node from './node';
import {COMMENT} from './types';

export default class Comment extends Node {
    constructor (opts) {
        super(opts);
        this.type = COMMENT;
    }
}
