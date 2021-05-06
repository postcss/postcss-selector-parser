import cssesc from "cssesc";
import unesc from "../util/unesc";
import Namespace from './namespace';
import {ATTRIBUTE} from './types';

const deprecate = require("util-deprecate");

const WRAPPED_IN_QUOTES = /^('|")([^]*)\1$/;

const warnOfDeprecatedValueAssignment = deprecate(() => {},
    "Assigning an attribute a value containing characters that might need to be escaped is deprecated. " +
    "Call attribute.setValue() instead.");

const warnOfDeprecatedQuotedAssignment = deprecate(() => {},
    "Assigning attr.quoted is deprecated and has no effect. Assign to attr.quoteMark instead.");

const warnOfDeprecatedConstructor = deprecate(() => {},
    "Constructing an Attribute selector with a value without specifying quoteMark is deprecated. Note: The value should be unescaped now.");

export function unescapeValue (value) {
    let deprecatedUsage = false;
    let quoteMark = null;
    let unescaped = value;
    let m = unescaped.match(WRAPPED_IN_QUOTES);
    if (m) {
        quoteMark = m[1];
        unescaped = m[2];
    }
    unescaped = unesc(unescaped);
    if (unescaped !== value) {
        deprecatedUsage = true;
    }
    return {
        deprecatedUsage,
        unescaped,
        quoteMark,
    };
}

function handleDeprecatedContructorOpts (opts) {
    if (opts.quoteMark !== undefined) {
        return opts;
    }
    if (opts.value === undefined) {
        return opts;
    }
    warnOfDeprecatedConstructor();
    let {quoteMark, unescaped} = unescapeValue(opts.value);
    if (!opts.raws) {
        opts.raws = {};
    }
    if (opts.raws.value === undefined) {
        opts.raws.value = opts.value;
    }
    opts.value = unescaped;
    opts.quoteMark = quoteMark;
    return opts;
}

export default class Attribute extends Namespace {
    static NO_QUOTE = null;
    static SINGLE_QUOTE = "'";
    static DOUBLE_QUOTE = '"';
    constructor (opts = {}) {
        super(handleDeprecatedContructorOpts(opts));
        this.type = ATTRIBUTE;
        this.raws = this.raws || {};
        Object.defineProperty(this.raws, 'unquoted', {
            get: deprecate(() => this.value,
                "attr.raws.unquoted is deprecated. Call attr.value instead."),
            set: deprecate(() => this.value,
                "Setting attr.raws.unquoted is deprecated and has no effect. attr.value is unescaped by default now."),
        });
        this._constructed = true;
    }

    /**
     * Returns the Attribute's value quoted such that it would be legal to use
     * in the value of a css file. The original value's quotation setting
     * used for stringification is left unchanged. See `setValue(value, options)`
     * if you want to control the quote settings of a new value for the attribute.
     *
     * You can also change the quotation used for the current value by setting quoteMark.
     *
     * Options:
     *   * quoteMark {'"' | "'" | null} - Use this value to quote the value. If this
     *     option is not set, the original value for quoteMark will be used. If
     *     indeterminate, a double quote is used. The legal values are:
     *     * `null` - the value will be unquoted and characters will be escaped as necessary.
     *     * `'` - the value will be quoted with a single quote and single quotes are escaped.
     *     * `"` - the value will be quoted with a double quote and double quotes are escaped.
     *   * preferCurrentQuoteMark {boolean} - if true, prefer the source quote mark
     *     over the quoteMark option value.
     *   * smart {boolean} - if true, will select a quote mark based on the value
     *     and the other options specified here. See the `smartQuoteMark()`
     *     method.
     **/
    getQuotedValue (options = {}) {
        let quoteMark = this._determineQuoteMark(options);
        let cssescopts = CSSESC_QUOTE_OPTIONS[quoteMark];
        let escaped = cssesc(this._value, cssescopts);
        return escaped;
    }

    _determineQuoteMark (options) {
        return (options.smart) ? this.smartQuoteMark(options) : this.preferredQuoteMark(options);
    }

    /**
     * Set the unescaped value with the specified quotation options. The value
     * provided must not include any wrapping quote marks -- those quotes will
     * be interpreted as part of the value and escaped accordingly.
     */
    setValue (value, options = {}) {
        this._value = value;
        this._quoteMark = this._determineQuoteMark(options);
        this._syncRawValue();
    }

    /**
     * Intelligently select a quoteMark value based on the value's contents. If
     * the value is a legal CSS ident, it will not be quoted. Otherwise a quote
     * mark will be picked that minimizes the number of escapes.
     *
     * If there's no clear winner, the quote mark from these options is used,
     * then the source quote mark (this is inverted if `preferCurrentQuoteMark` is
     * true). If the quoteMark is unspecified, a double quote is used.
     *
     * @param options This takes the quoteMark and preferCurrentQuoteMark options
     * from the quoteValue method.
     */
    smartQuoteMark (options) {
        let v = this.value;
        let numSingleQuotes = v.replace(/[^']/g, '').length;
        let numDoubleQuotes = v.replace(/[^"]/g, '').length;
        if (numSingleQuotes + numDoubleQuotes === 0) {
            let escaped = cssesc(v, {isIdentifier: true});
            if (escaped === v) {
                return Attribute.NO_QUOTE;
            } else {
                let pref = this.preferredQuoteMark(options);
                if (pref === Attribute.NO_QUOTE) {
                    // pick a quote mark that isn't none and see if it's smaller
                    let quote = this.quoteMark || options.quoteMark || Attribute.DOUBLE_QUOTE;
                    let opts = CSSESC_QUOTE_OPTIONS[quote];
                    let quoteValue = cssesc(v, opts);
                    if (quoteValue.length < escaped.length) {
                        return quote;
                    }
                }
                return pref;
            }
        } else if (numDoubleQuotes === numSingleQuotes) {
            return this.preferredQuoteMark(options);
        } else if ( numDoubleQuotes < numSingleQuotes) {
            return Attribute.DOUBLE_QUOTE;
        } else {
            return Attribute.SINGLE_QUOTE;
        }
    }

    /**
     * Selects the preferred quote mark based on the options and the current quote mark value.
     * If you want the quote mark to depend on the attribute value, call `smartQuoteMark(opts)`
     * instead.
     */
    preferredQuoteMark (options) {
        let quoteMark = (options.preferCurrentQuoteMark) ? this.quoteMark : options.quoteMark;

        if (quoteMark === undefined) {
            quoteMark = (options.preferCurrentQuoteMark) ? options.quoteMark : this.quoteMark;
        }

        if (quoteMark === undefined) {
            quoteMark = Attribute.DOUBLE_QUOTE;
        }

        return quoteMark;
    }

    get quoted () {
        let qm = this.quoteMark;
        return qm === "'" || qm === '"';
    }

    set quoted (value) {
        warnOfDeprecatedQuotedAssignment();
    }

    /**
     * returns a single (`'`) or double (`"`) quote character if the value is quoted.
     * returns `null` if the value is not quoted.
     * returns `undefined` if the quotation state is unknown (this can happen when
     * the attribute is constructed without specifying a quote mark.)
     */
    get quoteMark () {
        return this._quoteMark;
    }

    /**
     * Set the quote mark to be used by this attribute's value.
     * If the quote mark changes, the raw (escaped) value at `attr.raws.value` of the attribute
     * value is updated accordingly.
     *
     * @param {"'" | '"' | null} quoteMark The quote mark or `null` if the value should be unquoted.
     */
    set quoteMark (quoteMark) {
        if (!this._constructed) {
            this._quoteMark = quoteMark;
            return;
        }
        if (this._quoteMark !== quoteMark) {
            this._quoteMark = quoteMark;
            this._syncRawValue();
        }
    }

    _syncRawValue () {
        let rawValue = cssesc(this._value, CSSESC_QUOTE_OPTIONS[this.quoteMark]);
        if (rawValue === this._value) {
            if (this.raws) {
                delete this.raws.value;
            }
        } else {
            this.raws.value = rawValue;
        }
    }

    get qualifiedAttribute () {
        return this.qualifiedName(this.raws.attribute || this.attribute);
    }

    get insensitiveFlag () {
        return this.insensitive ? 'i' : '';
    }

    get value () {
        return this._value;
    }

    /**
     * Before 3.0, the value had to be set to an escaped value including any wrapped
     * quote marks. In 3.0, the semantics of `Attribute.value` changed so that the value
     * is unescaped during parsing and any quote marks are removed.
     *
     * Because the ambiguity of this semantic change, if you set `attr.value = newValue`,
     * a deprecation warning is raised when the new value contains any characters that would
     * require escaping (including if it contains wrapped quotes).
     *
     * Instead, you should call `attr.setValue(newValue, opts)` and pass options that describe
     * how the new value is quoted.
     */
    set value (v) {
        if (this._constructed) {
            let {
                deprecatedUsage,
                unescaped,
                quoteMark,
            } = unescapeValue(v);
            if (deprecatedUsage) {
                warnOfDeprecatedValueAssignment();
            }
            if (unescaped === this._value && quoteMark === this._quoteMark) {
                return;
            }
            this._value = unescaped;
            this._quoteMark = quoteMark;
            this._syncRawValue();
        } else {
            this._value = v;
        }
    }

    get attribute () {
        return this._attribute;
    }

    set attribute (name) {
        this._handleEscapes("attribute", name);
        this._attribute = name;
    }

    _handleEscapes (prop, value) {
        if (this._constructed) {
            let escaped = cssesc(value, {isIdentifier: true});
            if (escaped !== value) {
                this.raws[prop] = escaped;
            } else {
                delete this.raws[prop];
            }
        }
    }

    _spacesFor (name) {
        let attrSpaces = {before: '', after: ''};
        let spaces = this.spaces[name] || {};
        let rawSpaces = (this.raws.spaces && this.raws.spaces[name]) || {};
        return Object.assign(attrSpaces, spaces, rawSpaces);
    }

    _stringFor (name, spaceName = name, concat = defaultAttrConcat) {
        let attrSpaces = this._spacesFor(spaceName);
        return concat(this.stringifyProperty(name), attrSpaces);
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

        count += this.stringifyProperty("attribute").length;
        count += attributeSpaces.after.length;
        let operatorSpaces = this._spacesFor("operator");
        count += operatorSpaces.before.length;
        let operator = this.stringifyProperty("operator");
        if (name === "operator") {
            return operator ? count : -1;
        }

        count += operator.length;
        count += operatorSpaces.after.length;
        let valueSpaces = this._spacesFor("value");
        count += valueSpaces.before.length;
        let value = this.stringifyProperty("value");
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
            this.rawSpaceBefore,
            '[',
        ];

        selector.push(this._stringFor('qualifiedAttribute', 'attribute'));

        if (this.operator && (this.value || this.value === '')) {
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
        selector.push(this.rawSpaceAfter);
        return selector.join('');
    }
}

const CSSESC_QUOTE_OPTIONS = {
    "'": {quotes: 'single', wrap: true},
    '"': {quotes: 'double', wrap: true},
    [null]: {isIdentifier: true},
};

function defaultAttrConcat (attrValue, attrSpaces) {
    return `${attrSpaces.before}${attrValue}${attrSpaces.after}`;
}
