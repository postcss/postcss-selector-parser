import * as t from './tokenTypes';

let atEnd        = /[ \n\t\r\{\(\)'"\\;/]/g,
    wordEnd      = /[ \n\t\r\(\)\*:;!&'"\+\|~>,\[\]\\]|\/(?=\*)/g;

export default function tokenize (input) {
    let tokens = [];
    let css    = input.css.valueOf();

    let code, next, quote, lines, last, content,
        nextLine, nextOffset, escaped, escapePos;

    let length = css.length;
    let offset = -1;
    let line   =  1;
    let pos    =  0;

    let unclosed = function (what, end) {
        if ( input.safe ) {
            css += end;
            next = css.length - 1;
        } else {
            throw input.error('Unclosed ' + what, line, pos - offset, pos);
        }
    };

    while ( pos < length ) {
        code = css.charCodeAt(pos);

        if ( code === t.newline ) {
            offset = pos;
            line  += 1;
        }

        switch ( code ) {
        case t.newline:
        case t.space:
        case t.tab:
        case t.cr:
        case t.feed:
            next = pos;
            do {
                next += 1;
                code = css.charCodeAt(next);
                if ( code === t.newline ) {
                    offset = next;
                    line  += 1;
                }
            } while (
                code === t.space   ||
                code === t.newline ||
                code === t.tab     ||
                code === t.cr      ||
                code === t.feed
            );

            tokens.push([t.space, css.slice(pos, next), line, pos - offset, pos]);
            pos = next - 1;
            break;

        case t.plus:
        case t.greaterThan:
        case t.tilde:
        case t.pipe:
            next = pos;
            do {
                next += 1;
                code = css.charCodeAt(next);
            } while (
                code === t.plus        ||
                code === t.greaterThan ||
                code === t.tilde       ||
                code === t.pipe
            );

            tokens.push([t.combinator, css.slice(pos, next), line, pos - offset, pos]);
            pos = next - 1;
            break;

        // Consume these characters as single tokens.
        case t.asterisk:
        case t.ampersand:
        case t.comma:
        case t.openSquare:
        case t.closeSquare:
        case t.colon:
        case t.semicolon:
        case t.openParenthesis:
        case t.closeParenthesis:
            tokens.push([code, css[pos], line, pos - offset, pos]);
            break;

        case t.singleQuote:
        case t.doubleQuote:
            quote = code === t.singleQuote ? "'" : '"';
            next  = pos;
            do {
                escaped = false;
                next    = css.indexOf(quote, next + 1);
                if ( next === -1 ) {
                    unclosed('quote', quote);
                }
                escapePos = next;
                while ( css.charCodeAt(escapePos - 1) === t.backslash ) {
                    escapePos -= 1;
                    escaped = !escaped;
                }
            } while ( escaped );

            tokens.push([t.str, css.slice(pos, next + 1),
                line, pos  - offset,
                line, next - offset,
                pos,
            ]);
            pos = next;
            break;

        case t.at:
            atEnd.lastIndex = pos + 1;
            atEnd.test(css);
            if ( atEnd.lastIndex === 0 ) {
                next = css.length - 1;
            } else {
                next = atEnd.lastIndex - 2;
            }
            tokens.push([t.atWord, css.slice(pos, next + 1),
                line, pos  - offset,
                line, next - offset,
                pos,
            ]);
            pos = next;
            break;

        case t.backslash:
            next   = pos;
            escaped = true;
            while ( css.charCodeAt(next + 1) === t.backslash ) {
                next  += 1;
                escaped = !escaped;
            }
            code = css.charCodeAt(next + 1);
            if (escaped && (
                code !== t.slash   &&
                code !== t.space   &&
                code !== t.newline &&
                code !== t.tab     &&
                code !== t.cr      &&
                code !== t.feed
            )) {
                next += 1;
            }
            tokens.push([t.word, css.slice(pos, next + 1),
                line, pos  - offset,
                line, next - offset,
                pos,
            ]);
            pos = next;
            break;

        default:
            if ( code === t.slash && css.charCodeAt(pos + 1) === t.asterisk ) {
                next = css.indexOf('*/', pos + 2) + 1;
                if ( next === 0 ) {
                    unclosed('comment', '*/');
                }

                content = css.slice(pos, next + 1);
                lines   = content.split('\n');
                last    = lines.length - 1;

                if ( last > 0 ) {
                    nextLine   = line + last;
                    nextOffset = next - lines[last].length;
                } else {
                    nextLine   = line;
                    nextOffset = offset;
                }

                tokens.push([t.comment, content,
                    line,     pos  - offset,
                    nextLine, next - nextOffset,
                    pos,
                ]);

                offset = nextOffset;
                line   = nextLine;
                pos    = next;

            } else {
                wordEnd.lastIndex = pos + 1;
                wordEnd.test(css);
                if ( wordEnd.lastIndex === 0 ) {
                    next = css.length - 1;
                } else {
                    next = wordEnd.lastIndex - 2;
                }

                tokens.push([t.word, css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset,
                    pos,
                ]);
                pos = next;
            }

            break;
        }

        pos++;
    }

    return tokens;
}
