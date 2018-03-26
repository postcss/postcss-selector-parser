const HEX_ESC = /\\(?:([0-9a-fA-F]{6})|([0-9a-fA-F]{1,5})(?: |(?![0-9a-fA-F])))/g;
const OTHER_ESC = /\\(.)/g;
export default function unesc (str) {
    str = str.replace(HEX_ESC, (_, hex1, hex2) => {
        let hex = hex1 || hex2;
        let code = parseInt(hex, 16);
        return String.fromCharCode(code);
    });
    str = str.replace(OTHER_ESC, (_, char) => char);
    return str;
}
