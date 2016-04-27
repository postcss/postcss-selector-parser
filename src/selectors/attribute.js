import Namespace from './namespace';

export default class Attribute extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = 'attribute';
        this.raws = {};
    }

    toString () {
        let selector = [
            this.spaces.before,
            '[',
            this.ns,
            this.attribute
        ];

        if (this.operator) { 
            selector.push(this.operator);
        }
        if (this.value) {
            selector.push(this.value);
        }
        if (this.raws.insensitive) {
            selector.push(this.raws.insensitive);
        } else if (this.insensitive) {
            selector.push(' i');
        }
        selector.push(']');
        return selector.concat(this.spaces.after).join('');
    }
}
