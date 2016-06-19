import Container from './container';
import {SELECTOR} from './types';

export default class Selector extends Container {
    constructor (opts) {
        super(opts);
        this.type = SELECTOR;
    }
}
