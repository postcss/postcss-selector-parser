// Many thanks for this post which made this migration much easier.
// https://mathiasbynens.be/notes/css-escapes

/**
 * 
 * @param {string} str 
 * @returns {[string, number]|undefined}
 */
function gobbleHex (str) {
    const lower = str.toLowerCase();
    let hex = '';
    let spaceTerminated = false;
    for (let i = 0; i < 6 && lower[i] !== undefined; i++) {
        const code =  lower.charCodeAt(i);
        // check to see if we are dealing with a valid hex char [a-f|0-9]
        const valid = (code >= 97 && code <= 102) || (code >= 48 && code <= 57);
        // https://drafts.csswg.org/css-syntax/#consume-escaped-code-point
        spaceTerminated = code === 32;
        if (!valid) {
            break;
        }
        hex += lower[i];
    }

    if (hex.length === 0) {
        return undefined;
    }
    const codePoint = parseInt(hex, 16);

    const isSurrogate = codePoint >= 0xD800 && codePoint <= 0xDFFF;
    // Add special case for
    // "If this number is zero, or is for a surrogate, or is greater than the maximum allowed code point"
    // https://drafts.csswg.org/css-syntax/#maximum-allowed-code-point
    if (isSurrogate || codePoint === 0x0000 || codePoint > 0x10FFFF) {
        return ['\uFFFD', hex.length + (spaceTerminated ? 1 : 0)];
    }

    return [
        String.fromCodePoint(codePoint),
        hex.length + (spaceTerminated ? 1 : 0),
    ];
}

const CONTAINS_ESCAPE = /\\/;

export default function unesc (str) {
    let needToProcess = CONTAINS_ESCAPE.test(str);
    if (!needToProcess) {
        return str;
    }
    let ret = "";

    for (let i = 0; i < str.length; i++) {
        if ((str[i] === "\\")) {
            const gobbled = gobbleHex(str.slice(i + 1, i + 7));
            if (gobbled !== undefined) {
                ret += gobbled[0];
                i += gobbled[1];
                continue;
            }

            // Retain a pair of \\ if double escaped `\\\\`
            // https://github.com/postcss/postcss-selector-parser/commit/268c9a7656fb53f543dc620aa5b73a30ec3ff20e
            if (str[i + 1] === "\\") {
                ret += "\\";
                i++;
                continue;
            }

            // if \\ is at the end of the string retain it
            // https://github.com/postcss/postcss-selector-parser/commit/01a6b346e3612ce1ab20219acc26abdc259ccefb
            if (str.length === i + 1) {
                ret += str[i];
            }
            continue;
        }
      
        ret += str[i];
    }

    return ret;
}
