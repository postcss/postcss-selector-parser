/*! https://mths.be/cssesc v3.0.0 by @mathias | MIT License */
// Inlined and trimmed to the subset of options postcss-selector-parser uses
// (`isIdentifier`, `quotes: "single" | "double"`, `wrap`). Output is identical
// to cssesc@3 for those options.
const regexSingleEscape = /[ -,./:-@[\]^`{-~]/;
const regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;

export default function cssesc(string, options = {}) {
  let quotes = options.quotes === "double" ? '"' : "'";
  let isIdentifier = options.isIdentifier;
  let firstChar = string.charAt(0);
  let output = "";
  let counter = 0;
  let length = string.length;

  while (counter < length) {
    let character = string.charAt(counter++);
    let codePoint = character.charCodeAt(0);
    let value;

    if (codePoint < 0x20 || codePoint > 0x7e) {
      if (codePoint >= 0xd800 && codePoint <= 0xdbff && counter < length) {
        let extra = string.charCodeAt(counter++);
        if ((extra & 0xfc00) === 0xdc00) {
          codePoint = ((codePoint & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
        } else {
          counter--;
        }
      }
      value = "\\" + codePoint.toString(16).toUpperCase() + " ";
    } else {
      if (/[\t\n\f\r\v]/.test(character)) {
        value = "\\" + codePoint.toString(16).toUpperCase() + " ";
      } else if (
        character === "\\" ||
        (!isIdentifier && character === quotes) ||
        (isIdentifier && regexSingleEscape.test(character))
      ) {
        value = "\\" + character;
      } else {
        value = character;
      }
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

  output = output.replace(regexExcessiveSpaces, ($0, $1, $2) => {
    if ($1 && $1.length % 2) return $0;
    return ($1 || "") + $2;
  });

  if (!isIdentifier && options.wrap) {
    return quotes + output + quotes;
  }
  return output;
}
