import Container, {MAX_NESTING_DEPTH} from './container';
import {PSEUDO} from './types';

export default class Pseudo extends Container {
    constructor (opts) {
        super(opts);
        this.type = PSEUDO;
    }

    toString (depth = 0) {
        if (depth >= MAX_NESTING_DEPTH) {
            throw new Error(
                `Cannot serialize selector: nesting depth exceeds the maximum of ${MAX_NESTING_DEPTH}.`
            );
        }
        let params = this.length
            ? '(' + this.map(child => child.toString(depth + 1)).join(',') + ')'
            : '';
        return [
            this.rawSpaceBefore,
            this.stringifyProperty("value"),
            params,
            this.rawSpaceAfter,
        ].join('');
    }
}
