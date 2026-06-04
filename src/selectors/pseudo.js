import {resolveMaxNestingDepth} from '../util';
import Container from './container';
import {PSEUDO} from './types';

export default class Pseudo extends Container {
    constructor (opts) {
        super(opts);
        this.type = PSEUDO;
    }

    toString (options = {}, depth = 0) {
        let max = resolveMaxNestingDepth(options.maxNestingDepth);
        if (depth >= max) {
            throw new Error(
                `Cannot serialize selector: nesting depth exceeds the maximum of ${max}.`
            );
        }
        let params = this.length
            ? '(' + this.map(child => child.toString(options, depth + 1)).join(',') + ')'
            : '';
        return [
            this.rawSpaceBefore,
            this.stringifyProperty("value"),
            params,
            this.rawSpaceAfter,
        ].join('');
    }
}
