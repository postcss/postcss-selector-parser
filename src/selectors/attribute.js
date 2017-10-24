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

    _spacesFor (name) {
        let attrSpaces = {before: '', after: ''};
        let spaces = this.spaces[name] || {};
        let rawSpaces = (this.raws.spaces && this.raws.spaces[name]) || {};
        return Object.assign(attrSpaces, spaces, rawSpaces);
    }
    _valueFor (name) {
        return this.raws[name] || this[name];
    }

    _stringFor (name, spaceName = name, concat = defaultAttrConcat) {
        let attrSpaces = this._spacesFor(spaceName);
        return concat(this._valueFor(name), attrSpaces);
    }

    /**
     * returns the offset of the attribute part specified relative to the
     * start of the node of the output string.
     *
     * * "ns" - alias for "namespace"
     * * "namespace" - the namespace if it exists.
     * * "attribute" - the attribute name
     * * "attributeNS" - the start of the attribute or its namespace
     * * "operator" - the match operator of the attribute
     * * "value" - The value (string or identifier)
     * * "insensitive" - the case insensitivity flag;
     * @param part One of the possible values inside an attribute.
     * @returns -1 if the name is invalid or the value doesn't exist in this attribute.
     */
    offsetOf (name) {
        let count = 1;
        let attributeSpaces = this._spacesFor("attribute");
        count += attributeSpaces.before.length;
        if (name === "namespace" || name === "ns") {
            return (this.namespace) ? count : -1;
        }
        if (name === "attributeNS") {
            return count;
        }

        count += this.namespaceString.length;
        if (this.namespace) {
            count += 1;
        }
        if (name === "attribute") {
            return count;
        }

        count += this._valueFor("attribute").length;
        count += attributeSpaces.after.length;
        let operatorSpaces = this._spacesFor("operator");
        count += operatorSpaces.before.length;
        let operator = this._valueFor("operator");
        if (name === "operator") {
            return operator ? count : -1;
        }

        count += operator.length;
        count += operatorSpaces.after.length;
        let valueSpaces = this._spacesFor("value");
        count += valueSpaces.before.length;
        let value = this._valueFor("value");
        if (name === "value") {
            return value ? count : -1;
        }

        count += value.length;
        count += valueSpaces.after.length;
        let insensitiveSpaces = this._spacesFor("insensitive");
        count += insensitiveSpaces.before.length;
        if (name === "insensitive") {
            return (this.insensitive) ? count : -1;
        }
        return -1;
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
