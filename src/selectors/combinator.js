import Node from './node';

export default class Combinator extends Node {
    constructor (opts) {
        super(opts);
        this.type = 'combinator';
    }
}
