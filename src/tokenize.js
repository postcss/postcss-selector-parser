import * as t from './tokenTypes';

const wordEnd = /[ \n\t\r\(\)\*:;!&'"\+\|~>,\[\]\\]|\/(?=\*)/g;

export default function tokenize (input) {
    let tokens = [];
    let css    = input.css.valueOf();

    let code, next, quote, lines, last, content,
        nextLine, nextOffset, escaped, escapePos;

    let length = css.length;
    let offset = -1;
    let line   =  1;
    let start  =  0;

    let unclosed = function (what, fix) {
        if ( input.safe ) {
            css += fix;
            next = css.length - 1;
        } else {
            throw input.error('Unclosed ' + what, line, start - offset, start);
        }
    };

    while ( start < length ) {
        code = css.charCodeAt(start);

        if ( code === t.newline ) {
            offset = start;
            line  += 1;
        }

        switch ( code ) {
        case t.newline:
        case t.space:
        case t.tab:
        case t.cr:
        case t.feed:
            next = start;
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

            tokens.push([
                t.space,                // token type
                css.slice(start, next), // content
                line,                   // start line
                start - offset,         // start column
                start,                  // source index
            ]);

            start = next;
            break;

        case t.plus:
        case t.greaterThan:
        case t.tilde:
        case t.pipe:
            next = start;
            do {
                next += 1;
                code = css.charCodeAt(next);
            } while (
                code === t.plus        ||
                code === t.greaterThan ||
                code === t.tilde       ||
                code === t.pipe
            );

            tokens.push([
                t.combinator,           // token type
                css.slice(start, next), // content
                line,                   // start line
                start - offset,         // start column
                start,                  // source index
            ]);

            start = next;
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
            tokens.push([
                code,           // token type
                css[start],     // content
                line,           // start line
                start - offset, // start column
                start,          // source index
            ]);
            start ++;
            break;

        case t.singleQuote:
        case t.doubleQuote:
            quote = code === t.singleQuote ? "'" : '"';
            next  = start;
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

            tokens.push([
                t.str,                      // token type
                css.slice(start, next + 1), // content
                line,                       // start line
                start - offset,             // start column
                line,                       // end line
                next - offset,              // end column
                start,                      // source index
            ]);

            start = next + 1;
            break;

        case t.backslash:
            next   = start;
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
            tokens.push([
                t.word,                     // token type
                css.slice(start, next + 1), // content
                line,                       // start line
                start - offset,             // start column
                line,                       // end line
                next - offset,              // end column
                start,                      // source index
            ]);

            start = next + 1;
            break;

        default:
            if ( code === t.slash && css.charCodeAt(start + 1) === t.asterisk ) {
                next = css.indexOf('*/', start + 2) + 1;
                if ( next === 0 ) {
                    unclosed('comment', '*/');
                }

                content = css.slice(start, next + 1);
                lines   = content.split('\n');
                last    = lines.length - 1;

                if ( last > 0 ) {
                    nextLine   = line + last;
                    nextOffset = next - lines[last].length;
                } else {
                    nextLine   = line;
                    nextOffset = offset;
                }

                tokens.push([
                    t.comment,         // token type
                    content,           // content
                    line,              // start line
                    start - offset,    // start column
                    nextLine,          // end line
                    next - nextOffset, // end column
                    start,             // source index
                ]);

                offset = nextOffset;
                line   = nextLine;
                start  = next + 1;

            } else {
                wordEnd.lastIndex = start + 1;
                wordEnd.test(css);
                if ( wordEnd.lastIndex === 0 ) {
                    next = css.length - 1;
                } else {
                    next = wordEnd.lastIndex - 2;
                }

                tokens.push([
                    t.word,                     // token type
                    css.slice(start, next + 1), // content
                    line,                       // start line
                    start - offset,             // start column
                    line,                       // end line
                    next - offset,              // end column
                    start,                      // source index
                ]);

                start = next + 1;
            }

            break;
        }
    }

    return tokens;
}
