import {
    ATTRIBUTE,
    CLASS,
    COMBINATOR,
    COMMENT,
    ID,
    NESTING,
    PSEUDO,
    ROOT,
    SELECTOR,
    STRING,
    TAG,
    UNIVERSAL,
} from "./types";

const IS_TYPE = {
    [ATTRIBUTE]: true,
    [CLASS]: true,
    [COMBINATOR]: true,
    [COMMENT]: true,
    [ID]: true,
    [NESTING]: true,
    [PSEUDO]: true,
    [ROOT]: true,
    [SELECTOR]: true,
    [STRING]: true,
    [TAG]: true,
    [UNIVERSAL]: true,
};

export function isNode (node) {
    return (typeof node === "object" && IS_TYPE[node.type]);
}

function isNodeType (type, node) {
    return isNode(node) && node.type === type;
}

export const isAttribute = isNodeType.bind(null, ATTRIBUTE);
export const isClassName = isNodeType.bind(null, CLASS);
export const isCombinator = isNodeType.bind(null, COMBINATOR);
export const isComment = isNodeType.bind(null, COMMENT);
export const isIdentifier = isNodeType.bind(null, ID);
export const isNesting = isNodeType.bind(null, NESTING);
export const isPseudo = isNodeType.bind(null, PSEUDO);
export const isRoot = isNodeType.bind(null, ROOT);
export const isSelector = isNodeType.bind(null, SELECTOR);
export const isString = isNodeType.bind(null, STRING);
export const isTag = isNodeType.bind(null, TAG);
export const isUniversal = isNodeType.bind(null, UNIVERSAL);

export function isPseudoElement (node) {
    return isPseudo(node)
           && node.value
           && (
               node.value.startsWith("::")
             || node.value.toLowerCase() === ":before"
             || node.value.toLowerCase() === ":after"
             || node.value.toLowerCase() === ":first-letter"
             || node.value.toLowerCase() === ":first-line"
           );
}
export function isPseudoClass (node) {
    return isPseudo(node) && !isPseudoElement(node);
}

export function isContainer (node) {
    return !!(isNode(node) && node.walk);
}

export function isNamespace (node) {
    return isAttribute(node) || isTag(node);
}
