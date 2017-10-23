import dotProp from 'dot-prop';
import indexesOf from 'indexes-of';
import uniq from 'uniq';

import Root from './selectors/root';
import Selector from './selectors/selector';
import ClassName from './selectors/className';
import Comment from './selectors/comment';
import ID from './selectors/id';
import Tag from './selectors/tag';
import Str from './selectors/string';
import Pseudo from './selectors/pseudo';
import Attribute from './selectors/attribute';
import Universal from './selectors/universal';
import Combinator from './selectors/combinator';
import Nesting from './selectors/nesting';

import sortAsc from './sortAscending';
import tokenize from './tokenize';

import * as tokens from './tokenTypes';
import * as types from './selectors/types';

function getSource (startLine, startColumn, endLine, endColumn) {
    return {
        start: {
            line: startLine,
            column: startColumn,
        },
        end: {
            line: endLine,
            column: endColumn,
        },
    };
}

export default class Parser {
    constructor (rule, options = {}) {
        this.rule = rule;
        this.options = Object.assign({lossy: false, safe: false}, options);
        this.position = 0;
        this.root = new Root();
        this.root.errorGenerator = this._errorGenerator();


        const selector = new Selector();
        this.root.append(selector);
        this.current = selector;

        this.css = typeof this.rule === 'string' ? this.rule : this.rule.selector;

        if (this.options.lossy) {
            this.css = this.css.trim();
        }
        this.tokens = tokenize({
            css: this.css,
            error: this._errorGenerator(),
            safe: this.options.safe,
        });

        this.loop();
    }

    _errorGenerator () {
        return (message, errorOptions) => {
            if (typeof this.rule === 'string') {
                return new Error(message);
            }
            return this.rule.error(message, errorOptions);
        };
    }

    attribute () {
        const attr = [];
        const startingToken = this.currToken;
        this.position ++;
        while (
            this.position < this.tokens.length &&
            this.currToken[0] !== tokens.closeSquare
        ) {
            attr.push(this.currToken);
            this.position ++;
        }
        if (this.currToken[0] !== tokens.closeSquare) {
            return this.expected('closing square bracket', this.currToken[5]);
        }

        const len = attr.length;
        const node = {
            source: getSource(
                startingToken[1],
                startingToken[2],
                this.currToken[3],
                this.currToken[4]
            ),
            sourceIndex: startingToken[5],
        };

        if (len === 1 && !~[tokens.word].indexOf(attr[0][0])) {
            return this.expected('attribute', attr[0][5]);
        }

        let pos = 0;
        let spaceBefore = '';
        let commentBefore = '';
        let lastAdded = null;

        while (pos < len) {
            const token = attr[pos];
            const content = this.content(token);
            const next = attr[pos + 1];

            switch (token[0]) {
            case tokens.space:
                if (
                    len === 1 ||
                    pos === 0 && this.content(next) === '|'
                ) {
                    return this.expected('attribute', token[5], content);
                }
                if (this.options.lossy) {
                    break;
                }
                if (!lastAdded || this.content(next) === 'i') {
                    spaceBefore = content;
                } else {
                    dotProp.set(node, lastAdded, dotProp.get(node, lastAdded) + content);
                }
                break;
            case tokens.asterisk:
                if (next[0] === tokens.equals) {
                    node.operator = content;
                    lastAdded = 'operator';
                } else if (!node.namespace && next) {
                    node.namespace = `${this.parseSpace(spaceBefore)}${content}`;
                    lastAdded = 'namespace';
                    spaceBefore = '';
                }
                break;
            case tokens.dollar:
            case tokens.caret:
                if (next[0] === tokens.equals) {
                    node.operator = content;
                    lastAdded = 'operator';
                }
                break;
            case tokens.combinator:
                if (content === '~' && next[0] === tokens.equals) {
                    node.operator = content;
                    lastAdded = 'operator';
                }
                if (content !== '|') {
                    break;
                }
                if (next[0] === tokens.equals) {
                    node.operator = content;
                    lastAdded = 'operator';
                } else if (!node.namespace && !node.attribute) {
                    node.namespace = true;
                }
                break;
            case tokens.word:
                if (
                    next &&
                    this.content(next) === '|' &&
                    (attr[pos + 2] && attr[pos + 2][0] !== tokens.equals) &&
                    !node.operator &&
                    !node.namespace
                ) {
                    node.namespace = content;
                    lastAdded = 'namespace';
                } else if (!node.attribute) {
                    node.attribute = `${this.parseSpace(spaceBefore)}${commentBefore}${content}`;
                    lastAdded = 'attribute';
                    spaceBefore = '';
                    commentBefore = '';
                } else if (!node.value) {
                    node.value = content;
                    lastAdded = 'value';
                    dotProp.set(node, 'raws.unquoted', content);
                } else if (content === 'i') {
                    node.insensitive = true;
                    if (!this.options.lossy) {
                        lastAdded = 'raws.insensitive';
                        dotProp.set(node, lastAdded, `${spaceBefore}${content}`);
                        spaceBefore = '';
                    }
                }
                break;
            case tokens.str:
                if (!node.attribute || !node.operator) {
                    return this.error(`Expected an attribute followed by an operator preceding the string.`, {
                        index: token[5],
                    });
                }
                node.value = content;
                node.quoted = true;
                lastAdded = 'value';
                dotProp.set(node, 'raws.unquoted', content.slice(1, -1));
                break;
            case tokens.equals:
                if (!node.attribute) {
                    return this.expected('attribute', token[5], content);
                }
                if (node.value) {
                    return this.error('Unexpected "=" found; an operator was already defined.', {index: token[5]});
                }
                node.operator = node.operator ? `${node.operator}${content}` : content;
                lastAdded = 'operator';
                break;
            case tokens.comment:
                if (lastAdded) {
                    dotProp.set(node, lastAdded, dotProp.get(node, lastAdded) + content);
                } else {
                    commentBefore = content;
                }
                break;
            default:
                return this.error(`Unexpected "${content}" found.`, {index: token[5]});
            }
            pos ++;
        }

        this.newNode(new Attribute(node));
        this.position ++;
    }

    combinator () {
        const current = this.currToken;
        if (this.content() === '|') {
            return this.namespace();
        }
        const node = new Combinator({
            value: '',
            source: getSource(
                current[1],
                current[2],
                current[3],
                current[4]
            ),
            sourceIndex: current[5],
        });
        while ( this.position < this.tokens.length && this.currToken &&
                (this.currToken[0] === tokens.space ||
                this.currToken[0] === tokens.combinator)) {
            const content = this.content();
            if (this.nextToken && this.nextToken[0] === tokens.combinator) {
                node.spaces.before = this.parseSpace(content);
                node.source = getSource(
                    this.nextToken[1],
                    this.nextToken[2],
                    this.nextToken[3],
                    this.nextToken[4]
                );
                node.sourceIndex = this.nextToken[5];
            } else if (this.prevToken && this.prevToken[0] === tokens.combinator) {
                node.spaces.after = this.parseSpace(content);
            } else if (this.currToken[0] === tokens.combinator) {
                node.value = content;
            } else if (this.currToken[0] === tokens.space) {
                node.value = this.parseSpace(content, ' ');
            }
            this.position ++;
        }
        return this.newNode(node);
    }

    comma () {
        if (this.position === this.tokens.length - 1) {
            this.root.trailingComma = true;
            this.position ++;
            return;
        }
        const selector = new Selector();
        this.current.parent.append(selector);
        this.current = selector;
        this.position ++;
    }

    comment () {
        const current = this.currToken;
        this.newNode(new Comment({
            value: this.content(),
            source: getSource(
                current[1],
                current[2],
                current[3],
                current[4]
            ),
            sourceIndex: current[5],
        }));
        this.position ++;
    }

    error (message, opts) {
        throw this.root.error(message, opts);
    }

    missingBackslash () {
        return this.error('Expected a backslash preceding the semicolon.', {
            index: this.currToken[5],
        });
    }

    missingParenthesis () {
        return this.expected('opening parenthesis', this.currToken[5]);
    }

    missingSquareBracket () {
        return this.expected('opening square bracket', this.currToken[5]);
    }

    namespace () {
        const before = this.prevToken && this.content(this.prevToken) || true;
        if (this.nextToken[0] === tokens.word) {
            this.position ++;
            return this.word(before);
        } else if (this.nextToken[0] === tokens.asterisk) {
            this.position ++;
            return this.universal(before);
        }
    }

    nesting () {
        const current = this.currToken;
        this.newNode(new Nesting({
            value: this.content(),
            source: getSource(
                current[1],
                current[2],
                current[3],
                current[4]
            ),
            sourceIndex: current[5],
        }));
        this.position ++;
    }

    parentheses () {
        const last = this.current.last;
        let balanced = 1;
        this.position ++;
        if (last && last.type === types.PSEUDO) {
            const selector = new Selector();
            const cache = this.current;
            last.append(selector);
            this.current = selector;
            while (this.position < this.tokens.length && balanced) {
                if (this.currToken[0] === tokens.openParenthesis) {
                    balanced ++;
                }
                if (this.currToken[0] === tokens.closeParenthesis) {
                    balanced --;
                }
                if (balanced) {
                    this.parse();
                } else {
                    selector.parent.source.end.line = this.currToken[3];
                    selector.parent.source.end.column = this.currToken[4];
                    this.position ++;
                }
            }
            this.current = cache;
        } else {
            last.value += '(';
            while (this.position < this.tokens.length && balanced) {
                if (this.currToken[0] === tokens.openParenthesis) {
                    balanced ++;
                }
                if (this.currToken[0] === tokens.closeParenthesis) {
                    balanced --;
                }
                last.value += this.parseParenthesisToken(this.currToken);
                this.position ++;
            }
        }
        if (balanced) {
            return this.expected('closing parenthesis', this.currToken[5]);
        }
    }

    pseudo () {
        let pseudoStr = '';
        let startingToken = this.currToken;
        while (this.currToken && this.currToken[0] === tokens.colon) {
            pseudoStr += this.content();
            this.position ++;
        }
        if (!this.currToken) {
            return this.expected(['pseudo-class', 'pseudo-element'], this.position - 1);
        }
        if (this.currToken[0] === tokens.word) {
            this.splitWord(false, (first, length) => {
                pseudoStr += first;
                this.newNode(new Pseudo({
                    value: pseudoStr,
                    source: getSource(
                        startingToken[1],
                        startingToken[2],
                        this.currToken[3],
                        this.currToken[4]
                    ),
                    sourceIndex: startingToken[5],
                }));
                if (
                    length > 1 &&
                    this.nextToken &&
                    this.nextToken[0] === tokens.openParenthesis
                ) {
                    this.error('Misplaced parenthesis.', {
                        index: this.nextToken[5],
                    });
                }
            });
        } else {
            return this.expected(['pseudo-class', 'pseudo-element'], this.currToken[5]);
        }
    }

    space () {
        const content = this.content();
        // Handle space before and after the selector
        if (
            this.position === 0 ||
            this.prevToken[0] === tokens.comma ||
            this.prevToken[0] === tokens.openParenthesis
        ) {
            this.spaces = this.parseSpace(content);
            this.position ++;
        } else if (
            this.position === (this.tokens.length - 1) ||
            this.nextToken[0] === tokens.comma ||
            this.nextToken[0] === tokens.closeParenthesis
        ) {
            this.current.last.spaces.after = this.parseSpace(content);
            this.position ++;
        } else {
            this.combinator();
        }
    }

    string () {
        const current = this.currToken;
        this.newNode(new Str({
            value: this.content(),
            source: getSource(
                current[1],
                current[2],
                current[3],
                current[4]
            ),
            sourceIndex: current[5],
        }));
        this.position ++;
    }

    universal (namespace) {
        const nextToken = this.nextToken;
        if (nextToken && this.content(nextToken) === '|') {
            this.position ++;
            return this.namespace();
        }
        const current = this.currToken;
        this.newNode(new Universal({
            value: this.content(),
            source: getSource(
                current[1],
                current[2],
                current[3],
                current[4]
            ),
            sourceIndex: current[5],
        }), namespace);
        this.position ++;
    }

    splitWord (namespace, firstCallback) {
        let nextToken = this.nextToken;
        let word = this.content();
        while (
            nextToken &&
            ~[tokens.dollar, tokens.caret, tokens.equals, tokens.word].indexOf(nextToken[0])
        ) {
            this.position ++;
            let current = this.content();
            word += current;
            if (current.lastIndexOf('\\') === current.length - 1) {
                let next = this.nextToken;
                if (next && next[0] === tokens.space) {
                    word += this.parseSpace(this.content(next), ' ');
                    this.position ++;
                }
            }
            nextToken = this.nextToken;
        }
        const hasClass = indexesOf(word, '.');
        let hasId = indexesOf(word, '#');
        // Eliminate Sass interpolations from the list of id indexes
        const interpolations = indexesOf(word, '#{');
        if (interpolations.length) {
            hasId = hasId.filter(hashIndex => !~interpolations.indexOf(hashIndex));
        }
        let indices = sortAsc(uniq([0, ...hasClass, ...hasId]));
        indices.forEach((ind, i) => {
            const index = indices[i + 1] || word.length;
            const value = word.slice(ind, index);
            if (i === 0 && firstCallback) {
                return firstCallback.call(this, value, indices.length);
            }
            let node;
            const current = this.currToken;
            const sourceIndex = current[5] + indices[i];
            const source = getSource(
                current[1],
                current[2] + ind,
                current[3],
                current[2] + (index - 1)
            );
            if (~hasClass.indexOf(ind)) {
                node = new ClassName({
                    value: value.slice(1),
                    source,
                    sourceIndex,
                });
            } else if (~hasId.indexOf(ind)) {
                node = new ID({
                    value: value.slice(1),
                    source,
                    sourceIndex,
                });
            } else {
                node = new Tag({
                    value,
                    source,
                    sourceIndex,
                });
            }
            this.newNode(node, namespace);
            // Ensure that the namespace is used only once
            namespace = null;
        });
        this.position ++;
    }

    word (namespace) {
        const nextToken = this.nextToken;
        if (nextToken && this.content(nextToken) === '|') {
            this.position ++;
            return this.namespace();
        }
        return this.splitWord(namespace);
    }

    loop () {
        while (this.position < this.tokens.length) {
            this.parse(true);
        }
        return this.root;
    }

    parse (throwOnParenthesis) {
        switch (this.currToken[0]) {
        case tokens.space:
            this.space();
            break;
        case tokens.comment:
            this.comment();
            break;
        case tokens.openParenthesis:
            this.parentheses();
            break;
        case tokens.closeParenthesis:
            if (throwOnParenthesis) {
                this.missingParenthesis();
            }
            break;
        case tokens.openSquare:
            this.attribute();
            break;
        case tokens.dollar:
        case tokens.caret:
        case tokens.equals:
        case tokens.word:
            this.word();
            break;
        case tokens.colon:
            this.pseudo();
            break;
        case tokens.comma:
            this.comma();
            break;
        case tokens.asterisk:
            this.universal();
            break;
        case tokens.ampersand:
            this.nesting();
            break;
        case tokens.combinator:
            this.combinator();
            break;
        case tokens.str:
            this.string();
            break;
        // These cases throw; no break needed.
        case tokens.closeSquare:
            this.missingSquareBracket();
        case tokens.semicolon:
            this.missingBackslash();
        }
    }

    /**
     * Helpers
     */

    expected (description, index, found) {
        if (Array.isArray(description)) {
            const last = description.pop();
            description = `${description.join(', ')} or ${last}`;
        }
        const an = /^[aeiou]/.test(description[0]) ? 'an' : 'a';
        if (!found) {
            return this.error(
                `Expected ${an} ${description}.`,
                {index}
            );
        }
        return this.error(
            `Expected ${an} ${description}, found "${found}" instead.`,
            {index}
        );
    }

    parseNamespace (namespace) {
        if (this.options.lossy && typeof namespace === 'string') {
            const trimmed = namespace.trim();
            if (!trimmed.length) {
                return true;
            }

            return trimmed;
        }

        return namespace;
    }

    parseSpace (space, replacement = '') {
        return this.options.lossy ? replacement : space;
    }

    parseValue (value) {
        if (!this.options.lossy || !value || typeof value !== 'string') {
            return value;
        }
        return value.trim();
    }

    parseParenthesisToken (token) {
        const content = this.content(token);
        if (!this.options.lossy) {
            return content;
        }

        if (token[0] === tokens.space) {
            return this.parseSpace(content, ' ');
        }

        return this.parseValue(content);
    }

    newNode (node, namespace) {
        if (namespace) {
            node.namespace = this.parseNamespace(namespace);
        }
        if (this.spaces) {
            node.spaces.before = this.spaces;
            this.spaces = '';
        }
        return this.current.append(node);
    }

    content (token = this.currToken) {
        return this.css.slice(token[5], token[6]);
    }

    get currToken () {
        return this.tokens[this.position];
    }

    get nextToken () {
        return this.tokens[this.position + 1];
    }

    get prevToken () {
        return this.tokens[this.position - 1];
    }
}
