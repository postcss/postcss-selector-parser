import flatten from 'flatten';
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
    constructor (input) {
        this.input = input;
        this.lossy = input.options.lossless === false;
        this.position = 0;
        this.root = new Root();

        const selector = new Selector();
        this.root.append(selector);

        this.current = selector;
        if (this.lossy) {
            this.tokens = tokenize({safe: input.safe, css: input.css.trim()});
        } else {
            this.tokens = tokenize(input);
        }

        return this.loop();
    }

    attribute () {
        let str = '';
        const startingToken = this.currToken;
        this.position ++;
        while (
            this.position < this.tokens.length &&
            this.currToken[0] !== tokens.closeSquare
        ) {
            str += this.tokens[this.position][1];
            this.position ++;
        }
        if (this.position === this.tokens.length && !~str.indexOf(']')) {
            this.error('Expected a closing square bracket.');
        }
        const parts = str.split(/((?:[*~^$|]?=))([^]*)/);
        const namespace = parts[0].split(/(\|)/g);
        const attributeProps = {
            operator: parts[1],
            value: parts[2],
            source: getSource(
                startingToken[2],
                startingToken[3],
                this.currToken[2],
                this.currToken[3]
            ),
            sourceIndex: startingToken[4],
        };
        if (namespace.length > 1) {
            if (namespace[0] === '') {
                namespace[0] = true;
            }
            attributeProps.attribute = this.parseValue(namespace[2]);
            attributeProps.namespace = this.parseNamespace(namespace[0]);
        } else {
            attributeProps.attribute = this.parseValue(parts[0]);
        }
        const attr = new Attribute(attributeProps);

        if (parts[2]) {
            const insensitive = parts[2].split(/(\s+i\s*?)$/);
            const trimmedValue = insensitive[0].trim();
            attr.value = this.lossy ? trimmedValue : insensitive[0];
            if (insensitive[1]) {
                attr.insensitive = true;
                if (!this.lossy) {
                    attr.raws.insensitive = insensitive[1];
                }
            }
            attr.quoted = trimmedValue[0] === '\'' || trimmedValue[0] === '"';
            attr.raws.unquoted = attr.quoted ? trimmedValue.slice(1, -1) : trimmedValue;
        }
        this.newNode(attr);
        this.position++;
    }

    combinator () {
        const current = this.currToken;
        if (current[1] === '|') {
            return this.namespace();
        }
        const node = new Combinator({
            value: '',
            source: getSource(
                current[2],
                current[3],
                current[2],
                current[3]
            ),
            sourceIndex: current[4],
        });
        while ( this.position < this.tokens.length && this.currToken &&
                (this.currToken[0] === tokens.space ||
                this.currToken[0] === tokens.combinator)) {
            if (this.nextToken && this.nextToken[0] === tokens.combinator) {
                node.spaces.before = this.parseSpace(this.currToken[1]);
                node.source = getSource(
                    this.nextToken[2],
                    this.nextToken[3],
                    this.nextToken[2],
                    this.nextToken[3]
                );
                node.sourceIndex = this.nextToken[4];
            } else if (this.prevToken && this.prevToken[0] === tokens.combinator) {
                node.spaces.after = this.parseSpace(this.currToken[1]);
            } else if (this.currToken[0] === tokens.combinator) {
                node.value = this.currToken[1];
            } else if (this.currToken[0] === tokens.space) {
                node.value = this.parseSpace(this.currToken[1], ' ');
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
            value: current[1],
            source: getSource(
                current[2],
                current[3],
                current[4],
                current[5]
            ),
            sourceIndex: current[6],
        }));
        this.position++;
    }

    error (message) {
        throw new this.input.error(message); // eslint-disable-line new-cap
    }

    missingBackslash () {
        return this.error('Expected a backslash preceding the semicolon.');
    }

    missingParenthesis () {
        return this.error('Expected opening parenthesis.');
    }

    missingSquareBracket () {
        return this.error('Expected opening square bracket.');
    }

    namespace () {
        const before = this.prevToken && this.prevToken[1] || true;
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
            value: current[1],
            source: getSource(
                current[2],
                current[3],
                current[2],
                current[3]
            ),
            sourceIndex: current[4],
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
                    balanced++;
                }
                if (this.currToken[0] === tokens.closeParenthesis) {
                    balanced--;
                }
                if (balanced) {
                    this.parse();
                } else {
                    selector.parent.source.end.line = this.currToken[2];
                    selector.parent.source.end.column = this.currToken[3];
                    this.position ++;
                }
            }
            this.current = cache;
        } else {
            last.value += '(';
            while (this.position < this.tokens.length && balanced) {
                if (this.currToken[0] === tokens.openParenthesis) {
                    balanced++;
                }
                if (this.currToken[0] === tokens.closeParenthesis) {
                    balanced--;
                }
                last.value += this.parseParenthesisToken(this.currToken);
                this.position++;
            }
        }
        if (balanced) {
            this.error('Expected closing parenthesis.');
        }
    }

    pseudo () {
        let pseudoStr = '';
        let startingToken = this.currToken;
        while (this.currToken && this.currToken[0] === tokens.colon) {
            pseudoStr += this.currToken[1];
            this.position ++;
        }
        if (!this.currToken) {
            return this.error('Expected pseudo-class or pseudo-element');
        }
        if (this.currToken[0] === tokens.word) {
            this.splitWord(false, (first, length) => {
                pseudoStr += first;
                this.newNode(new Pseudo({
                    value: pseudoStr,
                    source: getSource(
                        startingToken[2],
                        startingToken[3],
                        this.currToken[4],
                        this.currToken[5]
                    ),
                    sourceIndex: startingToken[4],
                }));
                if (
                    length > 1 &&
                    this.nextToken &&
                    this.nextToken[0] === tokens.openParenthesis
                ) {
                    this.error('Misplaced parenthesis.');
                }
            });
        } else {
            this.error('Unexpected "' + this.currToken[0] + '" found.');
        }
    }

    space () {
        const token = this.currToken;
        // Handle space before and after the selector
        if (
            this.position === 0 ||
            this.prevToken[0] === tokens.comma ||
            this.prevToken[0] === tokens.openParenthesis
        ) {
            this.spaces = this.parseSpace(token[1]);
            this.position ++;
        } else if (
            this.position === (this.tokens.length - 1) ||
            this.nextToken[0] === tokens.comma ||
            this.nextToken[0] === tokens.closeParenthesis
        ) {
            this.current.last.spaces.after = this.parseSpace(token[1]);
            this.position ++;
        } else {
            this.combinator();
        }
    }

    string () {
        const token = this.currToken;
        this.newNode(new Str({
            value: token[1],
            source: getSource(
                token[2],
                token[3],
                token[4],
                token[5]
            ),
            sourceIndex: token[6],
        }));
        this.position ++;
    }

    universal (namespace) {
        const nextToken = this.nextToken;
        if (nextToken && nextToken[1] === '|') {
            this.position ++;
            return this.namespace();
        }
        const current = this.currToken;
        this.newNode(new Universal({
            value: current[1],
            source: getSource(
                current[2],
                current[3],
                current[2],
                current[3]
            ),
            sourceIndex: current[4],
        }), namespace);
        this.position ++;
    }

    splitWord (namespace, firstCallback) {
        let nextToken = this.nextToken;
        let word = this.currToken[1];
        while (nextToken && nextToken[0] === tokens.word) {
            this.position ++;
            let current = this.currToken[1];
            word += current;
            if (current.lastIndexOf('\\') === current.length - 1) {
                let next = this.nextToken;
                if (next && next[0] === tokens.space) {
                    word += this.parseSpace(next[1], ' ');
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
        let indices = sortAsc(uniq(flatten([[0], hasClass, hasId])));
        indices.forEach((ind, i) => {
            const index = indices[i + 1] || word.length;
            const value = word.slice(ind, index);
            if (i === 0 && firstCallback) {
                return firstCallback.call(this, value, indices.length);
            }
            let node;
            const current = this.currToken;
            const sourceIndex = current[6] + indices[i];
            const source = getSource(
                current[2],
                current[3] + ind,
                current[4],
                current[3] + (index - 1)
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
                    value: value,
                    source,
                    sourceIndex,
                });
            }
            this.newNode(node, namespace);
        });
        this.position ++;
    }

    word (namespace) {
        const nextToken = this.nextToken;
        if (nextToken && nextToken[1] === '|') {
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

    parseNamespace (namespace) {
        if (this.lossy && typeof namespace === 'string') {
            const trimmed = namespace.trim();
            if (!trimmed.length) {
                return true;
            }

            return trimmed;
        }

        return namespace;
    }

    parseSpace (space, replacement = '') {
        return this.lossy ? replacement : space;
    }

    parseValue (value) {
        if (!this.lossy || !value || typeof value !== 'string') {
            return value;
        }
        return value.trim();
    }

    parseParenthesisToken (token) {
        if (!this.lossy) {
            return token[1];
        }

        if (token[0] === tokens.space) {
            return this.parseSpace(token[1], ' ');
        }

        return this.parseValue(token[1]);
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
