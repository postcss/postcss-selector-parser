import Namespace from './namespace';
import {ATTRIBUTE} from './types';

export default class Attribute extends Namespace {
    constructor (opts = {}) {
        super(opts);
        this.type = ATTRIBUTE;
        this.raws = this.raws || {};
    }

    get qualifiedAttribute () {
        return this.qualifiedName(this.raws.attribute || this.attribute);
    }

    get insensitiveFlag () {
        return this.insensitive ? 'i' : '';
    }

    _stringFor (name, spaceName = name, concat = defaultAttrConcat) {
        let attrSpaces = {before: '', after: ''};
        let spaces = this.spaces[spaceName] || {};
        let rawSpaces = (this.raws.spaces && this.raws.spaces[spaceName]) || {};
        Object.assign(attrSpaces, spaces, rawSpaces);
        return concat(this.raws[name] || this[name], attrSpaces);
    }

    toString () {
        let selector = [
            this.spaces.before,
            '[',
        ];

        selector.push(this._stringFor('qualifiedAttribute', 'attribute'));

        if (this.operator && this.value) {
            selector.push(this._stringFor('operator'));
            selector.push(this._stringFor('value'));
            selector.push(this._stringFor('insensitiveFlag', 'insensitive', (attrValue, attrSpaces) => {
                if (attrValue.length > 0
                    && !this.quoted
                    && attrSpaces.before.length === 0
                    && !(this.spaces.value && this.spaces.value.after)) {
                    attrSpaces.before = " ";
                }
                return defaultAttrConcat(attrValue, attrSpaces);
            }));
        }

        selector.push(']');
        selector.push(this.spaces.after);
        return selector.join('');
    }
}

function defaultAttrConcat (attrValue, attrSpaces) {
    return `${attrSpaces.before}${attrValue}${attrSpaces.after}`;
}
