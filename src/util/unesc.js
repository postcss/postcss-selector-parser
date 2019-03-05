const whitespace = '[\\x20\\t\\r\\n\\f]';
const unescapeRegExp = new RegExp('\\\\([\\da-f]{1,6}' + whitespace + '?|(' + whitespace + ')|.)', 'ig');

export default function unesc (str) {
    return str.replace(unescapeRegExp, (_, escaped, escapedWhitespace) => {
        const high = '0x' + escaped - 0x10000;

        // NaN means non-codepoint
        // Workaround erroneous numeric interpretation of +"0x"
        // eslint-disable-next-line no-self-compare
        return high !== high || escapedWhitespace
            ? escaped
            : high < 0
                ? // BMP codepoint
                String.fromCharCode(high + 0x10000)
                : // Supplemental Plane codepoint (surrogate pair)
                String.fromCharCode((high >> 10) | 0xd800, (high & 0x3ff) | 0xdc00);
    });
}
