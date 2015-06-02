'use strict';

import Root from './selectors/root';
import Selector from './selectors/selector';
import ClassName from './selectors/className';
import Comment from './selectors/comment';
import ID from './selectors/id';
import Tag from './selectors/tag';
import Pseudo from './selectors/pseudo';
import Attribute from './selectors/attribute';
import Universal from './selectors/universal';
import Combinator from './selectors/combinator';

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

        return this.parse();
    }

    attribute () {
        let attribute = '';
        let attr;
        this.position ++;
        while (this.position < this.tokens.length && this.currToken[0] !== ']') {
            attribute += this.tokens[this.position][1];
            this.position ++;
        }
        if (this.position === this.tokens.length && !~attribute.indexOf(']')) {
            this.error('Expected a closing square bracket.');
        }
        let parts = attribute.split(/((?:[*~^$|]?)=)/);
        let namespace = parts[0].split(/(\|)/g);
        if (namespace.length > 1) {
            if (namespace[0] === '') { namespace[0] = true; }
            attr = new Attribute({
                attribute: namespace[2],
                namespace: namespace[0],
                operator: parts[1],
                value: parts[2]
            });
        } else {
            attr = new Attribute({
                attribute: parts[0],
                operator: parts[1],
                value: parts[2]
            });
        }

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
        let combinator = new Combinator({value: ''});
        while ( this.position < this.tokens.length &&
                this.currToken[0] === 'space' ||
                this.currToken[0] === 'combinator') {
            if (this.nextToken[0] === 'combinator') {
                combinator.spaces.before = this.currToken[1];
            } else if (this.prevToken[0] === 'combinator') {
                combinator.spaces.after = this.currToken[1];
            } else if (this.currToken[0] === 'space' || this.currToken[0] === 'combinator') {
                combinator.value = this.currToken[1];
            }
            this.position ++;
            if (this.position === this.tokens.length) {
                this.error('Unexpected right hand side combinator.');
            }
        }
        if (!this.current.last) {
            this.error('Unexpected left hand side combinator.');
        }
        return this.newNode(combinator);
    }

    comma () {
        if (this.position === this.tokens.length - 1) {
            this.error('Unexpected trailing comma.');
        }
        let selectors = new Selector();
        this.current.parent.append(selectors);
        this.current = selectors;
        this.position ++;
    }

    comment () {
        let comment = new Comment({value: this.currToken[1]});
        this.newNode(comment);
        this.position++;
    }

    error (message) {
        throw new this.input.error(message);
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

    pseudo () {
        let pseudoStr = '';
        while (this.currToken[0] === ':') {
            pseudoStr += this.currToken[1];
            this.position ++;
        }
        if (this.currToken[0] === 'word') {
            pseudoStr += this.currToken[1];
            this.position ++;
            let pseudo = new Pseudo({value: pseudoStr});
            this.newNode(pseudo);
            if (this.currToken && this.currToken[0] === '(') {
                let balanced = 1;
                let inside = [];
                this.position ++;
                while (this.position < this.tokens.length && balanced) {
                    if (this.currToken[0] === '(') balanced++;
                    if (this.currToken[0] === ')') balanced--;
                    if (balanced) {
                        inside.push(this.currToken);
                    }
                    this.position ++;
                }
                if (balanced) {
                    this.error('Expected closing parenthesis.');
                }
                let cache = {
                    current: this.current,
                    tokens: this.tokens,
                    position: this.position
                };
                this.position = 0;
                this.tokens = inside;
                this.current = pseudo;
                while (this.position < this.tokens.length) {
                    switch (this.currToken[0]) {
                        case 'space':
                            this.space();
                            break;
                        case 'comment':
                            this.comment();
                            break;
                        case '[':
                            this.attribute();
                            break;
                        case 'word':
                            this.word();
                            break;
                        case ':':
                            this.pseudo();
                            break;
                        case ',':
                            if (this.position === this.tokens.length - 1) {
                                this.error('Unexpected trailing comma.');
                            }
                            this.position ++;
                            break;
                        case 'combinator':
                            this.combinator();
                            break;
                    }
                    this.position ++;
                }
                this.current = cache.current;
                this.tokens = cache.tokens;
                this.position = cache.position;
            }
        } else {
            this.error('Unexpected "' + this.currToken[0] + '" found.');
        }
    }

    space () {
        let token = this.currToken;
        // Handle space before and after the selector
        if (this.position === 0 || this.prevToken[0] === ',') {
            this.current.spaces.before = token[1];
            this.position ++;
        } else if (this.position === (this.tokens.length - 1)) {
            this.current.spaces.after = token[1];
            this.position ++;
        } else {
            this.combinator();
        }
    }

    universal (namespace) {
        let nextToken = this.nextToken;
        if (nextToken && nextToken[1] === '|') {
            this.position ++;
            return this.namespace();
        }
        this.newNode(new Universal({value: this.currToken[1]}), namespace);
        this.position ++;
    }

    word (namespace) {
        let nextToken = this.nextToken;
        if (nextToken && nextToken[1] === '|') {
            this.position ++;
            return this.namespace();
        }
        let word = this.currToken[1];
        while (nextToken && nextToken[0] === 'word') {
            this.position ++;
            let current = this.currToken[1];
            word += current;
            if (current.lastIndexOf('\\') === current.length - 1) {
                let next = this.nextToken;
                if (next[0] === 'space') {
                    word += next[1];
                    this.position ++;
                }
            }
            nextToken = this.nextToken;
        }
        let hasClass = indexesOf(word, '.');
        let hasId = indexesOf(word, '#');
        if (hasId.length > 1) {
            this.error('Unexpected "#" found.');
        }
        let indices = sortAsc(uniq(flatten([[0], hasClass, hasId])));
        indices.forEach((ind, i) => {
            let index = indices[i + 1] || word.length;
            let value = word.slice(ind, index);
            let node;
            if (~hasClass.indexOf(ind)) {
                node = new ClassName({value: value.slice(1)});
            } else if (~hasId.indexOf(ind)) {
                node = new ID({value: value.slice(1)});
            } else {
                node = new Tag({value: value});
            }
            this.newNode(node, namespace);
        });
        this.position ++;
    }

    parse () {
        while (this.position < this.tokens.length) {
            switch (this.currToken[0]) {
                case 'space':
                    this.space();
                    break;
                case 'comment':
                    this.comment();
                    break;
                case '[':
                    this.attribute();
                    break;
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
                case 'combinator':
                    this.combinator();
                    break;
            }
        }
        return this.root;
    }

    /**
     * Helpers
     */

    newNode (node, namespace) {
        if (namespace) {
            node.namespace = namespace;
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
