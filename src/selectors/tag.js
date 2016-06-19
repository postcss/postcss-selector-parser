import Namespace from './namespace';
import {TAG} from './types';

export default class Tag extends Namespace {
    constructor (opts) {
        super(opts);
        this.type = TAG;
    }
}
