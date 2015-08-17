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

        return this.loop();
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
                if (this.currToken[0] === '(') balanced++;
                if (this.currToken[0] === ')') balanced--;
                if (balanced) {
                    this.parse();
                } else {
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
                if (this.currToken[0] === '(') balanced++;
                if (this.currToken[0] === ')') balanced--;
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
        while (this.currToken[0] === ':') {
            pseudoStr += this.currToken[1];
            this.position ++;
        }
        if (this.currToken[0] === 'word') {
            let pseudo;
            this.splitWord(false, (first, length) => {
                pseudoStr += first;
                pseudo = new Pseudo({value: pseudoStr});
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

    universal (namespace) {
        let nextToken = this.nextToken;
        if (nextToken && nextToken[1] === '|') {
            this.position ++;
            return this.namespace();
        }
        this.newNode(new Universal({value: this.currToken[1]}), namespace);
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
            case 'combinator':
                this.combinator();
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
