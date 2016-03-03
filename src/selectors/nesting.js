import Node from './node';

export default class Nesting extends Node {
    constructor (opts) {
        super(opts);
        this.type = 'nesting';
        this.value = '&';
    }
}
