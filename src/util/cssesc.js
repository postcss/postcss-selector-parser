/* !
 * Adapted from cssesc v3.0.0 <https://mths.be/cssesc>
 *
 * Copyright Mathias Bynens <https://mathiasbynens.be/>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// The only behavioural difference from cssesc 3.0.0 is how redundant spaces
// after `\HEX` escapes are removed: upstream uses a regular expression that
// backtracks quadratically on long runs of backslashes, which a crafted
// selector could use to pin a CPU core. removeExcessiveSpaces() produces the
// same output in linear time. Upstream has not been released since 2019, and
// the pending fix there (mathiasbynens/cssesc#36) changes the output. An
// unreachable branch escaping \t, \n, \f, \r and \x0B was also dropped: those
// characters are below 0x20 and always take the hex escape path first.

const DEFAULTS = {
    escapeEverything: false,
    isIdentifier: false,
    quotes: "single",
    wrap: false,
};

const hasOwnProperty = Object.prototype.hasOwnProperty;

function merge (options, defaults) {
    if (!options) {
        return defaults;
    }
    const result = {};
    for (const key in defaults) {
        result[key] = hasOwnProperty.call(options, key) ? options[key] : defaults[key];
    }
    return result;
}

const regexAnySingleEscape = /[ -,./:-@[-^`{-~]/;
const regexSingleEscape = /[ -,./:-@[\]^`{-~]/;

const BACKSLASH = 0x5c;
const SPACE = 0x20;

function isUpperHex (code) {
    return (code >= 0x30 && code <= 0x39) || (code >= 0x41 && code <= 0x46);
}

function isHexOrSpace (code) {
    return isUpperHex(code) || (code >= 0x61 && code <= 0x66) || code === SPACE;
}

/**
 * Remove spaces after `\HEX` escapes that are not followed by a hex digit or a
 * space, since they are redundant. This is only possible if the escape is not
 * preceded by an odd number of backslashes, which would make its own backslash
 * an escaped one.
 *
 * Same result as cssesc 3.0.0's
 * `output.replace(/(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g, ...)`:
 * a match can only start at the beginning of a run of backslashes and only
 * its last backslash can open the escape, so each run is measured once
 * instead of being re-scanned from every position inside it.
 */
function removeExcessiveSpaces (output) {
    const length = output.length;
    let result = "";
    let copied = 0;
    let i = 0;
    while (i < length) {
        if (output.charCodeAt(i) !== BACKSLASH) {
            i++;
            continue;
        }
        let runEnd = i + 1;
        while (runEnd < length && output.charCodeAt(runEnd) === BACKSLASH) {
            runEnd++;
        }
        // Look at up to 7 hex digits: more than 6 can never be followed directly
        // by the space.
        let hexEnd = runEnd;
        while (hexEnd < length && hexEnd - runEnd < 7 && isUpperHex(output.charCodeAt(hexEnd))) {
            hexEnd++;
        }
        const hexLength = hexEnd - runEnd;
        if (
            hexLength >= 1 &&
      hexLength <= 6 &&
      output.charCodeAt(hexEnd) === SPACE &&
      !isHexOrSpace(output.charCodeAt(hexEnd + 1))
        ) {
            // Backslashes preceding the one that opens the escape.
            if ((runEnd - i - 1) % 2 === 0) {
                result += output.slice(copied, hexEnd);
                copied = hexEnd + 1;
            }
            i = hexEnd + 1;
        } else {
            i = runEnd;
        }
    }
    return copied === 0 ? output : result + output.slice(copied);
}

// https://mathiasbynens.be/notes/css-escapes#css
export default function cssesc (string, options) {
    options = merge(options, DEFAULTS);
    if (options.quotes !== "single" && options.quotes !== "double") {
        options.quotes = "single";
    }
    const quote = options.quotes === "double" ? '"' : "'";
    const isIdentifier = options.isIdentifier;

    const firstChar = string.charAt(0);
    let output = "";
    let counter = 0;
    const length = string.length;
    while (counter < length) {
        const character = string.charAt(counter++);
        let codePoint = character.charCodeAt(0);
        let value;
        // If it's not a printable ASCII character...
        if (codePoint < 0x20 || codePoint > 0x7e) {
            if (codePoint >= 0xd800 && codePoint <= 0xdbff && counter < length) {
                // It's a high surrogate, and there is a next character.
                const extra = string.charCodeAt(counter++);
                if ((extra & 0xfc00) === 0xdc00) {
                    // next character is low surrogate
                    codePoint = ((codePoint & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
                } else {
                    // It's an unmatched surrogate; only append this code unit, in case
                    // the next code unit is the high surrogate of a surrogate pair.
                    counter--;
                }
            }
            value = "\\" + codePoint.toString(16).toUpperCase() + " ";
        } else if (options.escapeEverything) {
            if (regexAnySingleEscape.test(character)) {
                value = "\\" + character;
            } else {
                value = "\\" + codePoint.toString(16).toUpperCase() + " ";
            }
        } else if (
            character === "\\" ||
        (!isIdentifier &&
          ((character === '"' && quote === character) ||
            (character === "'" && quote === character))) ||
        (isIdentifier && regexSingleEscape.test(character))
        ) {
            value = "\\" + character;
        } else {
            value = character;
        }
        output += value;
    }

    if (isIdentifier) {
        if (/^-[-\d]/.test(output)) {
            output = "\\-" + output.slice(1);
        } else if (/\d/.test(firstChar)) {
            output = "\\3" + firstChar + " " + output.slice(1);
        }
    }

    output = removeExcessiveSpaces(output);

    if (!isIdentifier && options.wrap) {
        return quote + output + quote;
    }
    return output;
}
