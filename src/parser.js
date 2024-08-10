import Root from './selectors/root';
import Selector from './selectors/selector';
import ClassName from './selectors/className';
import Comment from './selectors/comment';
import ID from './selectors/id';
import Tag from './selectors/tag';
import Str from './selectors/string';
import Pseudo from './selectors/pseudo';
import Attribute, {unescapeValue} from './selectors/attribute';
import Universal from './selectors/universal';
import Combinator from './selectors/combinator';
import Nesting from './selectors/nesting';

import sortAsc from './sortAscending';
import tokenize, {FIELDS as TOKEN} from './tokenize';

import * as tokens from './tokenTypes';
import * as types from './selectors/types';
import {unesc, getProp, ensureObject} from './util';

const WHITESPACE_TOKENS = {
    [tokens.space]: true,
    [tokens.cr]: true,
    [tokens.feed]: true,
    [tokens.newline]: true,
    [tokens.tab]: true,
};

const WHITESPACE_EQUIV_TOKENS = {
    ...WHITESPACE_TOKENS,
    [tokens.comment]: true,
};

function tokenStart (token) {
    return {
        line: token[TOKEN.START_LINE],
        column: token[TOKEN.START_COL],
    };
}

function tokenEnd (token) {
    return {
        line: token[TOKEN.END_LINE],
        column: token[TOKEN.END_COL],
    };
}


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

function getTokenSource (token) {
    return getSource(
        token[TOKEN.START_LINE],
        token[TOKEN.START_COL],
        token[TOKEN.END_LINE],
        token[TOKEN.END_COL]
    );
}

function getTokenSourceSpan (startToken, endToken) {
    if (!startToken) {
        return undefined;
    }
    return getSource(
        startToken[TOKEN.START_LINE],
        startToken[TOKEN.START_COL],
        endToken[TOKEN.END_LINE],
        endToken[TOKEN.END_COL]
    );
}

function unescapeProp (node, prop) {
    let value = node[prop];
    if (typeof value !== "string") {
        return;
    }
    if (value.indexOf("\\") !== -1) {
        ensureObject(node, 'raws');
        node[prop] = unesc(value);
        if (node.raws[prop] === undefined) {
            node.raws[prop] = value;
        }
    }
    return node;
}

function indexesOf (array, item) {
    let i = -1;
    const indexes = [];

    while ((i = array.indexOf(item, i + 1)) !== -1) {
        indexes.push(i);
    }

    return indexes;
}

function uniqs () {
    const list = Array.prototype.concat.apply([], arguments);

    return list.filter((item, i) => i === list.indexOf(item));
}

export default class Parser {
    constructor (rule, options = {}) {
        this.rule = rule;
        this.options = Object.assign({lossy: false, safe: false}, options);
        this.position = 0;

        this.css = typeof this.rule === 'string' ? this.rule : this.rule.selector;

        this.tokens = tokenize({
            css: this.css,
            error: this._errorGenerator(),
            safe: this.options.safe,
        });

        let rootSource = getTokenSourceSpan(this.tokens[0], this.tokens[this.tokens.length - 1]);
        this.root = new Root({source: rootSource});
        this.root.errorGenerator = this._errorGenerator();


        const selector = new Selector({
            source: {start: {line: 1, column: 1}},
            sourceIndex: 0,
        });
        this.root.append(selector);
        this.current = selector;

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
            this.currToken[TOKEN.TYPE] !== tokens.closeSquare
        ) {
            attr.push(this.currToken);
            this.position ++;
        }
        if (this.currToken[TOKEN.TYPE] !== tokens.closeSquare) {
            return this.expected('closing square bracket', this.currToken[TOKEN.START_POS]);
        }

        const len = attr.length;
        const node = {
            source: getSource(
                startingToken[1],
                startingToken[2],
                this.currToken[3],
                this.currToken[4]
            ),
            sourceIndex: startingToken[TOKEN.START_POS],
        };

        if (len === 1 && !~[tokens.word].indexOf(attr[0][TOKEN.TYPE])) {
            return this.expected('attribute', attr[0][TOKEN.START_POS]);
        }

        let pos = 0;
        let spaceBefore = '';
        let commentBefore = '';
        let lastAdded = null;
        let spaceAfterMeaningfulToken = false;

        while (pos < len) {
            const token = attr[pos];
            const content = this.content(token);
            const next = attr[pos + 1];

            switch (token[TOKEN.TYPE]) {
            case tokens.space:
                // if (
                //     len === 1 ||
                //     pos === 0 && this.content(next) === '|'
                // ) {
                //     return this.expected('attribute', token[TOKEN.START_POS], content);
                // }
                spaceAfterMeaningfulToken = true;
                if (this.options.lossy) {
                    break;
                }
                if (lastAdded) {
                    ensureObject(node, 'spaces', lastAdded);
                    const prevContent = node.spaces[lastAdded].after || '';
                    node.spaces[lastAdded].after = prevContent + content;

                    const existingComment = getProp(node, 'raws', 'spaces', lastAdded, 'after') || null;

                    if (existingComment) {
                        node.raws.spaces[lastAdded].after = existingComment + content;
                    }
                } else {
                    spaceBefore = spaceBefore + content;
                    commentBefore = commentBefore + content;
                }
                break;
            case tokens.asterisk:
                if (next[TOKEN.TYPE] === tokens.equals) {
                    node.operator = content;
                    lastAdded = 'operator';
                } else if ((!node.namespace || (lastAdded === "namespace" && !spaceAfterMeaningfulToken)) && next) {
                    if (spaceBefore) {
                        ensureObject(node, 'spaces', 'attribute');
                        node.spaces.attribute.before = spaceBefore;
                        spaceBefore = '';
                    }
                    if (commentBefore) {
                        ensureObject(node, 'raws', 'spaces', 'attribute');
                        node.raws.spaces.attribute.before = spaceBefore;
                        commentBefore = '';
                    }
                    node.namespace = (node.namespace || "") + content;
                    const rawValue = getProp(node, 'raws', 'namespace') || null;
                    if (rawValue) {
                        node.raws.namespace += content;
                    }
                    lastAdded = 'namespace';
                }
                spaceAfterMeaningfulToken = false;
                break;
            case tokens.dollar:
                if (lastAdded === "value") {
                    let oldRawValue = getProp(node, 'raws', 'value');
                    node.value += "$";
                    if (oldRawValue) {
                        node.raws.value = oldRawValue + "$";
                    }
                    break;
                }
                // Falls through
            case tokens.caret:
                if (next[TOKEN.TYPE] === tokens.equals) {
                    node.operator = content;
                    lastAdded = 'operator';
                }
                spaceAfterMeaningfulToken = false;
                break;
            case tokens.combinator:
                if (content === '~' && next[TOKEN.TYPE] === tokens.equals) {
                    node.operator = content;
                    lastAdded = 'operator';
                }
                if (content !== '|') {
                    spaceAfterMeaningfulToken = false;
                    break;
                }
                if (next[TOKEN.TYPE] === tokens.equals) {
                    node.operator = content;
                    lastAdded = 'operator';
                } else if (!node.namespace && !node.attribute) {
                    node.namespace = true;
                }
                spaceAfterMeaningfulToken = false;
                break;
            case tokens.word:
                if (
                    next &&
                    this.content(next) === '|' &&
                    (attr[pos + 2] && attr[pos + 2][TOKEN.TYPE] !== tokens.equals) && // this look-ahead probably fails with comment nodes involved.
                    !node.operator &&
                    !node.namespace
                ) {
                    node.namespace = content;
                    lastAdded = 'namespace';
                } else if (!node.attribute || (lastAdded === "attribute" && !spaceAfterMeaningfulToken)) {
                    if (spaceBefore) {
                        ensureObject(node, 'spaces', 'attribute');
                        node.spaces.attribute.before = spaceBefore;

                        spaceBefore = '';
                    }
                    if (commentBefore) {
                        ensureObject(node, 'raws', 'spaces', 'attribute');
                        node.raws.spaces.attribute.before = commentBefore;
                        commentBefore = '';
                    }
                    node.attribute = (node.attribute || "") + content;
                    const rawValue = getProp(node, 'raws', 'attribute') || null;
                    if (rawValue) {
                        node.raws.attribute += content;
                    }
                    lastAdded = 'attribute';
                } else if ((!node.value && node.value !== "") || (lastAdded === "value" && !(spaceAfterMeaningfulToken || node.quoteMark))) {
                    let unescaped = unesc(content);
                    let oldRawValue = getProp(node, 'raws', 'value') || '';
                    let oldValue = node.value || '';
                    node.value = oldValue + unescaped;
                    node.quoteMark = null;
                    if (unescaped !== content || oldRawValue) {
                        ensureObject(node, 'raws');
                        node.raws.value = (oldRawValue || oldValue) + content;
                    }
                    lastAdded = 'value';
                } else {
                    let insensitive = (content === 'i' || content === "I");
                    if ((node.value || node.value === '') && (node.quoteMark || spaceAfterMeaningfulToken)) {
                        node.insensitive = insensitive;
                        if (!insensitive || content === "I") {
                            ensureObject(node, 'raws');
                            node.raws.insensitiveFlag = content;
                        }
                        lastAdded = 'insensitive';
                        if (spaceBefore) {
                            ensureObject(node, 'spaces', 'insensitive');
                            node.spaces.insensitive.before = spaceBefore;

                            spaceBefore = '';
                        }
                        if (commentBefore) {
                            ensureObject(node, 'raws', 'spaces', 'insensitive');
                            node.raws.spaces.insensitive.before = commentBefore;
                            commentBefore = '';
                        }
                    } else if (node.value || node.value === '') {
                        lastAdded = 'value';
                        node.value += content;
                        if (node.raws.value) {
                            node.raws.value += content;
                        }
                    }
                }
                spaceAfterMeaningfulToken = false;
                break;
            case tokens.str:
                if (!node.attribute || !node.operator) {
                    return this.error(`Expected an attribute followed by an operator preceding the string.`, {
                        index: token[TOKEN.START_POS],
                    });
                }
                let {unescaped, quoteMark} = unescapeValue(content);
                node.value = unescaped;
                node.quoteMark = quoteMark;
                lastAdded = 'value';

                ensureObject(node, 'raws');
                node.raws.value = content;

                spaceAfterMeaningfulToken = false;
                break;
            case tokens.equals:
                if (!node.attribute) {
                    return this.expected('attribute', token[TOKEN.START_POS], content);
                }
                if (node.value) {
                    return this.error('Unexpected "=" found; an operator was already defined.', {index: token[TOKEN.START_POS]});
                }
                node.operator = node.operator ? node.operator + content : content;
                lastAdded = 'operator';
                spaceAfterMeaningfulToken = false;
                break;
            case tokens.comment:
                if (lastAdded) {
                    if (spaceAfterMeaningfulToken || (next && next[TOKEN.TYPE] === tokens.space) ||
                        lastAdded === 'insensitive'
                    ) {
                        const lastComment = getProp(node, 'spaces', lastAdded, 'after') || '';
                        const rawLastComment = getProp(node, 'raws', 'spaces', lastAdded, 'after') || lastComment;

                        ensureObject(node, 'raws', 'spaces', lastAdded);
                        node.raws.spaces[lastAdded].after = rawLastComment + content;
                    } else {
                        const lastValue = node[lastAdded] || '';
                        const rawLastValue = getProp(node, 'raws', lastAdded) || lastValue;
                        ensureObject(node, 'raws');
                        node.raws[lastAdded] = rawLastValue + content;
                    }
                } else {
                    commentBefore = commentBefore + content;
                }
                break;
            default:
                return this.error(`Unexpected "${content}" found.`, {index: token[TOKEN.START_POS]});
            }
            pos ++;
        }
        unescapeProp(node, "attribute");
        unescapeProp(node, "namespace");
        this.newNode(new Attribute(node));
        this.position ++;
    }

    /**
     * return a node containing meaningless garbage up to (but not including) the specified token position.
     * if the token position is negative, all remaining tokens are consumed.
     *
     * This returns an array containing a single string node if all whitespace,
     * otherwise an array of comment nodes with space before and after.
     *
     * These tokens are not added to the current selector, the caller can add them or use them to amend
     * a previous node's space metadata.
     *
     * In lossy mode, this returns only comments.
     */
    parseWhitespaceEquivalentTokens (stopPosition) {
        if (stopPosition < 0) {
            stopPosition = this.tokens.length;
        }
        let startPosition = this.position;
        let nodes = [];
        let space = "";
        let lastComment = undefined;
        do {
            if (WHITESPACE_TOKENS[this.currToken[TOKEN.TYPE]]) {
                if (!this.options.lossy) {
                    space += this.content();
                }
            } else if (this.currToken[TOKEN.TYPE] === tokens.comment) {
                let spaces = {};
                if (space) {
                    spaces.before = space;
                    space = "";
                }
                lastComment = new Comment({
                    value: this.content(),
                    source: getTokenSource(this.currToken),
                    sourceIndex: this.currToken[TOKEN.START_POS],
                    spaces,
                });
                nodes.push(lastComment);
            }
        } while (++this.position < stopPosition);

        if (space) {
            if (lastComment) {
                lastComment.spaces.after = space;
            } else if (!this.options.lossy) {
                let firstToken = this.tokens[startPosition];
                let lastToken = this.tokens[this.position - 1];
                nodes.push(new Str({
                    value: '',
                    source: getSource(
                        firstToken[TOKEN.START_LINE],
                        firstToken[TOKEN.START_COL],
                        lastToken[TOKEN.END_LINE],
                        lastToken[TOKEN.END_COL],
                    ),
                    sourceIndex: firstToken[TOKEN.START_POS],
                    spaces: {before: space, after: ''},
                }));
            }
        }
        return nodes;
    }

    /**
     *
     * @param {*} nodes
     */
    convertWhitespaceNodesToSpace (nodes, requiredSpace = false) {
        let space = "";
        let rawSpace = "";
        nodes.forEach(n => {
            let spaceBefore = this.lossySpace(n.spaces.before, requiredSpace);
            let rawSpaceBefore = this.lossySpace(n.rawSpaceBefore, requiredSpace);
            space += spaceBefore + this.lossySpace(n.spaces.after, requiredSpace && spaceBefore.length === 0);
            rawSpace += spaceBefore + n.value + this.lossySpace(n.rawSpaceAfter, requiredSpace && rawSpaceBefore.length === 0);
        });
        if (rawSpace === space) {
            rawSpace = undefined;
        }
        let result = {space, rawSpace};
        return result;
    }

    isNamedCombinator (position = this.position) {
        return this.tokens[position + 0] && this.tokens[position + 0][TOKEN.TYPE] === tokens.slash &&
               this.tokens[position + 1] && this.tokens[position + 1][TOKEN.TYPE] === tokens.word &&
               this.tokens[position + 2] && this.tokens[position + 2][TOKEN.TYPE] === tokens.slash;

    }
    namedCombinator () {
        if (this.isNamedCombinator()) {
            let nameRaw = this.content(this.tokens[this.position + 1]);
            let name = unesc(nameRaw).toLowerCase();
            let raws = {};
            if (name !== nameRaw) {
                raws.value = `/${nameRaw}/`;
            }
            let node = new Combinator({
                value: `/${name}/`,
                source: getSource(
                    this.currToken[TOKEN.START_LINE],
                    this.currToken[TOKEN.START_COL],
                    this.tokens[this.position + 2][TOKEN.END_LINE],
                    this.tokens[this.position + 2][TOKEN.END_COL],
                ),
                sourceIndex: this.currToken[TOKEN.START_POS],
                raws,
            });
            this.position = this.position + 3;
            return node;
        } else {
            this.unexpected();
        }
    }

    combinator () {
        if (this.content() === '|') {
            return this.namespace();
        }
        // We need to decide between a space that's a descendant combinator and meaningless whitespace at the end of a selector.
        let nextSigTokenPos = this.locateNextMeaningfulToken(this.position);

        if (nextSigTokenPos < 0 || this.tokens[nextSigTokenPos][TOKEN.TYPE] === tokens.comma || this.tokens[nextSigTokenPos][TOKEN.TYPE] === tokens.closeParenthesis) {
            let nodes = this.parseWhitespaceEquivalentTokens(nextSigTokenPos);
            if (nodes.length > 0) {
                let last = this.current.last;
                if (last) {
                    let {space, rawSpace} = this.convertWhitespaceNodesToSpace(nodes);
                    if (rawSpace !== undefined) {
                        last.rawSpaceAfter += rawSpace;
                    }
                    last.spaces.after += space;
                } else {
                    nodes.forEach(n => this.newNode(n));
                }
            }
            return;
        }

        let firstToken = this.currToken;
        let spaceOrDescendantSelectorNodes = undefined;
        if (nextSigTokenPos > this.position) {
            spaceOrDescendantSelectorNodes = this.parseWhitespaceEquivalentTokens(nextSigTokenPos);
        }

        let node;
        if (this.isNamedCombinator()) {
            node = this.namedCombinator();
        } else if (this.currToken[TOKEN.TYPE] === tokens.combinator) {
            node = new Combinator({
                value: this.content(),
                source: getTokenSource(this.currToken),
                sourceIndex: this.currToken[TOKEN.START_POS],
            });
            this.position++;
        } else if (WHITESPACE_TOKENS[this.currToken[TOKEN.TYPE]]) {
            // pass
        } else if (!spaceOrDescendantSelectorNodes) {
            this.unexpected();
        }

        if (node) {
            if (spaceOrDescendantSelectorNodes) {
                let {space, rawSpace} = this.convertWhitespaceNodesToSpace(spaceOrDescendantSelectorNodes);
                node.spaces.before = space;
                node.rawSpaceBefore = rawSpace;
            }
        } else {
            // descendant combinator
            let {space, rawSpace} = this.convertWhitespaceNodesToSpace(spaceOrDescendantSelectorNodes, true);
            if (!rawSpace) {
                rawSpace = space;
            }
            let spaces = {};
            let raws = {spaces: {}};
            if (space.endsWith(' ') && rawSpace.endsWith(' ')) {
                spaces.before = space.slice(0, space.length - 1);
                raws.spaces.before = rawSpace.slice(0, rawSpace.length - 1);
            } else if (space.startsWith(' ') && rawSpace.startsWith(' ')) {
                spaces.after = space.slice(1);
                raws.spaces.after = rawSpace.slice(1);
            } else {
                raws.value = rawSpace;
            }
            node = new Combinator({
                value: ' ',
                source: getTokenSourceSpan(firstToken, this.tokens[this.position - 1]),
                sourceIndex: firstToken[TOKEN.START_POS],
                spaces,
                raws,
            });
        }

        if (this.currToken && this.currToken[TOKEN.TYPE] === tokens.space) {
            node.spaces.after = this.optionalSpace(this.content());
            this.position++;
        }

        return this.newNode(node);
    }

    comma () {
        if (this.position === this.tokens.length - 1) {
            this.root.trailingComma = true;
            this.position ++;
            return;
        }
        this.current._inferEndPosition();
        const selector = new Selector({
            source: {
                start: tokenStart(this.tokens[this.position + 1]),
            },
            sourceIndex: this.tokens[this.position + 1][TOKEN.START_POS],
        });
        this.current.parent.append(selector);
        this.current = selector;
        this.position ++;
    }

    comment () {
        const current = this.currToken;
        this.newNode(new Comment({
            value: this.content(),
            source: getTokenSource(current),
            sourceIndex: current[TOKEN.START_POS],
        }));
        this.position ++;
    }

    error (message, opts) {
        throw this.root.error(message, opts);
    }

    missingBackslash () {
        return this.error('Expected a backslash preceding the semicolon.', {
            index: this.currToken[TOKEN.START_POS],
        });
    }

    missingParenthesis () {
        return this.expected('opening parenthesis', this.currToken[TOKEN.START_POS]);
    }

    missingSquareBracket () {
        return this.expected('opening square bracket', this.currToken[TOKEN.START_POS]);
    }

    unexpected () {
        return this.error(`Unexpected '${this.content()}'. Escaping special characters with \\ may help.`, this.currToken[TOKEN.START_POS]);
    }

    unexpectedPipe () {
        return this.error(`Unexpected '|'.`, this.currToken[TOKEN.START_POS]);
    }

    namespace () {
        const before = this.prevToken && this.content(this.prevToken) || true;
        if (this.nextToken[TOKEN.TYPE] === tokens.word) {
            this.position ++;
            return this.word(before);
        } else if (this.nextToken[TOKEN.TYPE] === tokens.asterisk) {
            this.position ++;
            return this.universal(before);
        }

        this.unexpectedPipe();
    }

    nesting () {
        if (this.nextToken) {
            let nextContent = this.content(this.nextToken);
            if (nextContent === "|") {
                this.position++;
                return;
            }
        }
        const current = this.currToken;
        this.newNode(new Nesting({
            value: this.content(),
            source: getTokenSource(current),
            sourceIndex: current[TOKEN.START_POS],
        }));
        this.position ++;
    }

    parentheses () {
        let last = this.current.last;
        let unbalanced = 1;
        this.position ++;
        if (last && last.type === types.PSEUDO) {
            const selector = new Selector({
                source: {start: tokenStart(this.tokens[this.position])},
                sourceIndex: this.tokens[this.position][TOKEN.START_POS],
            });
            const cache = this.current;
            last.append(selector);
            this.current = selector;
            while (this.position < this.tokens.length && unbalanced) {
                if (this.currToken[TOKEN.TYPE] === tokens.openParenthesis) {
                    unbalanced ++;
                }
                if (this.currToken[TOKEN.TYPE] === tokens.closeParenthesis) {
                    unbalanced --;
                }
                if (unbalanced) {
                    this.parse();
                } else {
                    this.current.source.end = tokenEnd(this.currToken);
                    this.current.parent.source.end = tokenEnd(this.currToken);
                    this.position ++;
                }
            }
            this.current = cache;
        } else {
            // I think this case should be an error. It's used to implement a basic parse of media queries
            // but I don't think it's a good idea.
            let parenStart = this.currToken;
            let parenValue = "(";
            let parenEnd;
            while (this.position < this.tokens.length && unbalanced) {
                if (this.currToken[TOKEN.TYPE] === tokens.openParenthesis) {
                    unbalanced ++;
                }
                if (this.currToken[TOKEN.TYPE] === tokens.closeParenthesis) {
                    unbalanced --;
                }
                parenEnd = this.currToken;
                parenValue += this.parseParenthesisToken(this.currToken);
                this.position ++;
            }
            if (last) {
                last.appendToPropertyAndEscape("value", parenValue, parenValue);
            } else {
                this.newNode(new Str({
                    value: parenValue,
                    source: getSource(
                        parenStart[TOKEN.START_LINE],
                        parenStart[TOKEN.START_COL],
                        parenEnd[TOKEN.END_LINE],
                        parenEnd[TOKEN.END_COL],
                    ),
                    sourceIndex: parenStart[TOKEN.START_POS],
                }));
            }
        }
        if (unbalanced) {
            return this.expected('closing parenthesis', this.currToken[TOKEN.START_POS]);
        }
    }

    pseudo () {
        let pseudoStr = '';
        let startingToken = this.currToken;
        while (this.currToken && this.currToken[TOKEN.TYPE] === tokens.colon) {
            pseudoStr += this.content();
            this.position ++;
        }
        if (!this.currToken) {
            return this.expected(['pseudo-class', 'pseudo-element'], this.position - 1);
        }
        if (this.currToken[TOKEN.TYPE] === tokens.word) {
            this.splitWord(false, (first, length) => {
                pseudoStr += first;
                this.newNode(new Pseudo({
                    value: pseudoStr,
                    source: getTokenSourceSpan(startingToken, this.currToken),
                    sourceIndex: startingToken[TOKEN.START_POS],
                }));
                if (
                    length > 1 &&
                    this.nextToken &&
                    this.nextToken[TOKEN.TYPE] === tokens.openParenthesis
                ) {
                    this.error('Misplaced parenthesis.', {
                        index: this.nextToken[TOKEN.START_POS],
                    });
                }
            });
        } else {
            return this.expected(['pseudo-class', 'pseudo-element'], this.currToken[TOKEN.START_POS]);
        }
    }

    space () {
        const content = this.content();
        // Handle space before and after the selector
        if (
            this.position === 0 ||
            this.prevToken[TOKEN.TYPE] === tokens.comma ||
            this.prevToken[TOKEN.TYPE] === tokens.openParenthesis ||
            (this.current.nodes.every((node) => node.type === 'comment'))
        ) {
            this.spaces = this.optionalSpace(content);
            this.position ++;
        } else if (
            this.position === (this.tokens.length - 1) ||
            this.nextToken[TOKEN.TYPE] === tokens.comma ||
            this.nextToken[TOKEN.TYPE] === tokens.closeParenthesis
        ) {
            this.current.last.spaces.after = this.optionalSpace(content);
            this.position ++;
        } else {
            this.combinator();
        }
    }

    string () {
        const current = this.currToken;
        this.newNode(new Str({
            value: this.content(),
            source: getTokenSource(current),
            sourceIndex: current[TOKEN.START_POS],
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
            source: getTokenSource(current),
            sourceIndex: current[TOKEN.START_POS],
        }), namespace);
        this.position ++;
    }

    splitWord (namespace, firstCallback) {
        let nextToken = this.nextToken;
        let word = this.content();
        while (
            nextToken &&
            ~[tokens.dollar, tokens.caret, tokens.equals, tokens.word].indexOf(nextToken[TOKEN.TYPE])
        ) {
            this.position ++;
            let current = this.content();
            word += current;
            if (current.lastIndexOf('\\') === current.length - 1) {
                let next = this.nextToken;
                if (next && next[TOKEN.TYPE] === tokens.space) {
                    word += this.requiredSpace(this.content(next));
                    this.position ++;
                }
            }
            nextToken = this.nextToken;
        }
        const hasClass = indexesOf(word, '.').filter(i => {
            // Allow escaped dot within class name
            const escapedDot = word[i - 1] === '\\';
            // Allow decimal numbers percent in @keyframes
            const isKeyframesPercent = /^\d+\.\d+%$/.test(word);
            return !escapedDot && !isKeyframesPercent;
        });
        let hasId = indexesOf(word, '#').filter(i => word[i - 1] !== '\\');
        // Eliminate Sass interpolations from the list of id indexes
        const interpolations = indexesOf(word, '#{');
        if (interpolations.length) {
            hasId = hasId.filter(hashIndex => !~interpolations.indexOf(hashIndex));
        }
        let indices = sortAsc(uniqs([0, ...hasClass, ...hasId]));
        indices.forEach((ind, i) => {
            const index = indices[i + 1] || word.length;
            const value = word.slice(ind, index);
            if (i === 0 && firstCallback) {
                return firstCallback.call(this, value, indices.length);
            }
            let node;
            const current = this.currToken;
            const sourceIndex = current[TOKEN.START_POS] + indices[i];
            const source = getSource(
                current[1],
                current[2] + ind,
                current[3],
                current[2] + (index - 1)
            );
            if (~hasClass.indexOf(ind)) {
                let classNameOpts = {
                    value: value.slice(1),
                    source,
                    sourceIndex,
                };
                node = new ClassName(unescapeProp(classNameOpts, "value"));
            } else if (~hasId.indexOf(ind)) {
                let idOpts = {
                    value: value.slice(1),
                    source,
                    sourceIndex,
                };
                node = new ID(unescapeProp(idOpts, "value"));
            } else {
                let tagOpts = {
                    value,
                    source,
                    sourceIndex,
                };
                unescapeProp(tagOpts, "value");
                node = new Tag(tagOpts);
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
        this.current._inferEndPosition();
        return this.root;
    }

    parse (throwOnParenthesis) {
        switch (this.currToken[TOKEN.TYPE]) {
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
        case tokens.slash:
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
        default:
            this.unexpected();
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

    requiredSpace (space) {
        return this.options.lossy ? ' ' : space;
    }

    optionalSpace (space) {
        return this.options.lossy ? '' : space;
    }

    lossySpace (space, required) {
        if (this.options.lossy) {
            return required ? ' ' : '';
        } else {
            return space;
        }
    }

    parseParenthesisToken (token) {
        const content = this.content(token);
        if (token[TOKEN.TYPE] === tokens.space) {
            return this.requiredSpace(content);
        } else {
            return content;
        }
    }

    newNode (node, namespace) {
        if (namespace) {
            if (/^ +$/.test(namespace)) {
                if (!this.options.lossy) {
                    this.spaces = (this.spaces || '') + namespace;
                }
                namespace = true;
            }
            node.namespace = namespace;
            unescapeProp(node, "namespace");
        }
        if (this.spaces) {
            node.spaces.before = this.spaces;
            this.spaces = '';
        }
        return this.current.append(node);
    }

    content (token = this.currToken) {
        return this.css.slice(token[TOKEN.START_POS], token[TOKEN.END_POS]);
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

    /**
     * returns the index of the next non-whitespace, non-comment token.
     * returns -1 if no meaningful token is found.
     */
    locateNextMeaningfulToken (startPosition = this.position + 1) {
        let searchPosition = startPosition;
        while (searchPosition < this.tokens.length) {
            if (WHITESPACE_EQUIV_TOKENS[this.tokens[searchPosition][TOKEN.TYPE]]) {
                searchPosition++;
                continue;
            } else {
                return searchPosition;
            }
        }
        return -1;
    }
}
