'use strict';

import Node from './node';

export default class Namespace extends Node {
    get ns () {
        let n = this.namespace;
        return n ? (typeof n === 'string' ? n : '') + '|' : '';
    }

    toString () {
        return [
            this.ns,
            String(this.value)
        ].join('');
    }
};
