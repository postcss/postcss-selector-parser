import Namespace from './namespace';
import {UNIVERSAL} from './types';

export default class Universal extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = UNIVERSAL;
        this.value = '*';
    }
}
