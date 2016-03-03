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

import flatten from 'flatten';
import indexesOf from 'indexes-of';
import uniq from 'uniq';

export default class Parser {
    constructor (input) {
        this.input = input;
        this.position = 0;
        this.root = new Root();

        let selectors = new Selector();
        this.root.append(selectors);

        this.current = selectors;
        this.tokens = tokenize(input);

        return this.loop();
    }

    attribute () {
        let str = '';
        let attr;
        let startingToken = this.currToken;
        this.position ++;
        while (this.position < this.tokens.length && this.currToken[0] !== ']') {
            str += this.tokens[this.position][1];
            this.position ++;
        }
        if (this.position === this.tokens.length && !~str.indexOf(']')) {
            this.error('Expected a closing square bracket.');
        }
        let parts = str.split(/((?:[*~^$|]?)=)/);
        let namespace = parts[0].split(/(\|)/g);
        let attributeProps = {
            operator: parts[1],
            value: parts[2],
            source: {
                start: {
                    line: startingToken[2],
                    column: startingToken[3]
                },
                end: {
                    line: this.currToken[2],
                    column: this.currToken[3]
                }
            },
            sourceIndex: startingToken[4]
        };
        if (namespace.length > 1) {
            if (namespace[0] === '') {
                namespace[0] = true;
            }
            attributeProps.attribute = namespace[2];
            attributeProps.namespace = namespace[0];
        } else {
            attributeProps.attribute = parts[0];
        }
        attr = new Attribute(attributeProps);

        if (parts[2]) {
            let insensitive = parts[2].split(/(\s+i\s*?)$/);
            attr.value = insensitive[0];
            if (insensitive[1]) {
                attr.insensitive = true;
                attr.raw.insensitive = insensitive[1];
            }
        }
        this.newNode(attr);
        this.position++;
    }

    combinator () {
        if (this.currToken[1] === '|') {
            return this.namespace();
        }
        let node = new Combinator({
            value: '',
            source: {
                start: {
                    line: this.currToken[2],
                    column: this.currToken[3]
                },
                end: {
                    line: this.currToken[2],
                    column: this.currToken[3]
                }
            },
            sourceIndex: this.currToken[4]
        });
        while ( this.position < this.tokens.length && this.currToken &&
                (this.currToken[0] === 'space' ||
                this.currToken[0] === 'combinator')) {
            if (this.nextToken && this.nextToken[0] === 'combinator') {
                node.spaces.before = this.currToken[1];
                node.source.start.line = this.nextToken[2];
                node.source.start.column = this.nextToken[3];
                node.source.end.column = this.nextToken[3];
                node.source.end.line = this.nextToken[2];
                node.sourceIndex = this.nextToken[4];
            } else if (this.prevToken && this.prevToken[0] === 'combinator') {
                node.spaces.after = this.currToken[1];
            } else if (this.currToken[0] === 'space' || this.currToken[0] === 'combinator') {
                node.value = this.currToken[1];
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
        let selectors = new Selector();
        this.current.parent.append(selectors);
        this.current = selectors;
        this.position ++;
    }

    comment () {
        let node = new Comment({
            value: this.currToken[1],
            source: {
                start: {
                    line: this.currToken[2],
                    column: this.currToken[3]
                },
                end: {
                    line: this.currToken[4],
                    column: this.currToken[5]
                }
            },
            sourceIndex: this.currToken[6]
        });
        this.newNode(node);
        this.position++;
    }

    error (message) {
        throw new this.input.error(message); // eslint-disable-line new-cap
    }

    namespace () {
        let before = this.prevToken && this.prevToken[1] || true;
        if (this.nextToken[0] === 'word') {
            this.position ++;
            return this.word(before);
        } else if (this.nextToken[0] === '*') {
            this.position ++;
            return this.universal(before);
        }
    }
    
    nesting () {
        this.newNode(new Nesting({
            value: this.currToken[1],
            source: {
                start: {
                    line: this.currToken[2],
                    column: this.currToken[3]
                },
                end: {
                    line: this.currToken[2],
                    column: this.currToken[3]
                }
            },
            sourceIndex: this.currToken[4]
        }));
        this.position ++;
    }

    parentheses () {
        let last = this.current.last;
        if (last && last.type === 'pseudo') {
            let selector = new Selector();
            let cache = this.current;
            last.append(selector);
            this.current = selector;
            let balanced = 1;
            this.position ++;
            while (this.position < this.tokens.length && balanced) {
                if (this.currToken[0] === '(') {
                    balanced++;
                }
                if (this.currToken[0] === ')') {
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
            if (balanced) {
                this.error('Expected closing parenthesis.');
            }
            this.current = cache;
        } else {
            let balanced = 1;
            this.position ++;
            last.value += '(';
            while (this.position < this.tokens.length && balanced) {
                if (this.currToken[0] === '(') {
                    balanced++;
                }
                if (this.currToken[0] === ')') {
                    balanced--;
                }
                last.value += this.currToken[1];
                this.position++;
            }
            if (balanced) {
                this.error('Expected closing parenthesis.');
            }
        }
    }

    pseudo () {
        let pseudoStr = '';
        let startingToken = this.currToken;
        while (this.currToken && this.currToken[0] === ':') {
            pseudoStr += this.currToken[1];
            this.position ++;
        }
        if (!this.currToken) {
            return this.error('Expected pseudo-class or pseudo-element');
        }
        if (this.currToken[0] === 'word') {
            let pseudo;
            this.splitWord(false, (first, length) => {
                pseudoStr += first;
                pseudo = new Pseudo({
                    value: pseudoStr,
                    source: {
                        start: {
                            line: startingToken[2],
                            column: startingToken[3]
                        },
                        end: {
                            line: this.currToken[4],
                            column: this.currToken[5]
                        }
                    },
                    sourceIndex: startingToken[4]
                });
                this.newNode(pseudo);
                if (length > 1 && this.nextToken && this.nextToken[0] === '(') {
                    this.error('Misplaced parenthesis.');
                }
            });
        } else {
            this.error('Unexpected "' + this.currToken[0] + '" found.');
        }
    }

    space () {
        let token = this.currToken;
        // Handle space before and after the selector
        if (this.position === 0 || this.prevToken[0] === ',' || this.prevToken[0] === '(') {
            this.spaces = token[1];
            this.position ++;
        } else if (this.position === (this.tokens.length - 1) || this.nextToken[0] === ',' || this.nextToken[0] === ')') {
            this.current.last.spaces.after = token[1];
            this.position ++;
        } else {
            this.combinator();
        }
    }

    string () {
        let token = this.currToken;
        this.newNode(new Str({
            value: this.currToken[1],
            source: {
                start: {
                    line: token[2],
                    column: token[3]
                },
                end: {
                    line: token[4],
                    column: token[5]
                }
            },
            sourceIndex: token[6]
        }));
        this.position++;
    }

    universal (namespace) {
        let nextToken = this.nextToken;
        if (nextToken && nextToken[1] === '|') {
            this.position ++;
            return this.namespace();
        }
        this.newNode(new Universal({
            value: this.currToken[1],
            source: {
                start: {
                    line: this.currToken[2],
                    column: this.currToken[3]
                },
                end: {
                    line: this.currToken[2],
                    column: this.currToken[3]
                }
            },
            sourceIndex: this.currToken[4]
        }), namespace);
        this.position ++;
    }

    splitWord (namespace, firstCallback) {
        let nextToken = this.nextToken;
        let word = this.currToken[1];
        while (nextToken && nextToken[0] === 'word') {
            this.position ++;
            let current = this.currToken[1];
            word += current;
            if (current.lastIndexOf('\\') === current.length - 1) {
                let next = this.nextToken;
                if (next && next[0] === 'space') {
                    word += next[1];
                    this.position ++;
                }
            }
            nextToken = this.nextToken;
        }
        let hasClass = indexesOf(word, '.');
        let hasId = indexesOf(word, '#');
        let indices = sortAsc(uniq(flatten([[0], hasClass, hasId])));
        indices.forEach((ind, i) => {
            let index = indices[i + 1] || word.length;
            let value = word.slice(ind, index);
            if (i === 0 && firstCallback) {
                return firstCallback.call(this, value, indices.length);
            }
            let node;
            if (~hasClass.indexOf(ind)) {
                node = new ClassName({
                    value: value.slice(1),
                    source: {
                        start: {
                            line: this.currToken[2],
                            column: this.currToken[3] + ind
                        },
                        end: {
                            line: this.currToken[4],
                            column: this.currToken[3] + (index - 1)
                        }
                    },
                    sourceIndex: this.currToken[6] + indices[i]
                });
            } else if (~hasId.indexOf(ind)) {
                node = new ID({
                    value: value.slice(1),
                    source: {
                        start: {
                            line: this.currToken[2],
                            column: this.currToken[3] + ind
                        },
                        end: {
                            line: this.currToken[4],
                            column: this.currToken[3] + (index - 1)
                        }
                    },
                    sourceIndex: this.currToken[6] + indices[i]
                });
            } else {
                node = new Tag({
                    value: value,
                    source: {
                        start: {
                            line: this.currToken[2],
                            column: this.currToken[3] + ind
                        },
                        end: {
                            line: this.currToken[4],
                            column: this.currToken[3] + (index - 1)
                        }
                    },
                    sourceIndex: this.currToken[6] + indices[i]
                });
            }
            this.newNode(node, namespace);
        });
        this.position ++;
    }

    word (namespace) {
        let nextToken = this.nextToken;
        if (nextToken && nextToken[1] === '|') {
            this.position ++;
            return this.namespace();
        }
        return this.splitWord(namespace);
    }

    loop () {
        while (this.position < this.tokens.length) {
            this.parse();
        }
        return this.root;
    }

    parse () {
        switch (this.currToken[0]) {
        case 'space':
            this.space();
            break;
        case 'comment':
            this.comment();
            break;
        case '(':
            this.parentheses();
            break;
        case '[':
            this.attribute();
            break;
        case 'at-word':
        case 'word':
            this.word();
            break;
        case ':':
            this.pseudo();
            break;
        case ',':
            this.comma();
            break;
        case '*':
            this.universal();
            break;
        case '&':
            this.nesting();
            break;
        case 'combinator':
            this.combinator();
            break;
        case 'string':
            this.string();
            break;
        }
    }

    /**
     * Helpers
     */

    newNode (node, namespace) {
        if (namespace) {
            node.namespace = namespace;
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
