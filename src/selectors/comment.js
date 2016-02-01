import Node from './node';

export default class Comment extends Node {
    constructor (opts) {
        super(opts);
        this.type = 'comment';
    }
}
