import Node from './node';

export default class Namespace extends Node {
    get ns () {
        let n = this.namespace;
        return n ? (typeof n === 'string' ? n : '') + '|' : '';
    }

    toString () {
        return [
            this.spaces.before,
            this.ns,
            String(this.value),
            this.spaces.after
        ].join('');
    }
};
