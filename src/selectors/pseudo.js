import Container from './container';
import {PSEUDO} from './types';

export default class Pseudo extends Container {
    constructor (opts) {
        super(opts);
        this.type = PSEUDO;
    }

    _stringify (options, depth, max) {
        if (depth >= max) {
            throw new Error(
                `Cannot serialize selector: nesting depth exceeds the maximum of ${max}.`
            );
        }
        let params = this.length
            ? '(' + this.map(child => this._stringifyChild(child, options, depth + 1, max)).join(',') + ')'
            : '';
        return [
            this.rawSpaceBefore,
            this.stringifyProperty("value"),
            params,
            this.rawSpaceAfter,
        ].join('');
    }
}
