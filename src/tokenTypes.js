export const ampersand        = `&`.charCodeAt(0);
export const asterisk         = `*`.charCodeAt(0);
export const at               = `@`.charCodeAt(0);
export const comma            = `,`.charCodeAt(0);
export const colon            = `:`.charCodeAt(0);
export const semicolon        = `;`.charCodeAt(0);
export const openParenthesis  = `(`.charCodeAt(0);
export const closeParenthesis = `)`.charCodeAt(0);
export const openSquare       = `[`.charCodeAt(0);
export const closeSquare      = `]`.charCodeAt(0);
export const tilde            = `~`.charCodeAt(0);
export const plus             = `+`.charCodeAt(0);
export const pipe             = `|`.charCodeAt(0);
export const greaterThan      = `>`.charCodeAt(0);
export const space            = ` `.charCodeAt(0);
export const singleQuote      = `'`.charCodeAt(0);
export const doubleQuote      = `"`.charCodeAt(0);
export const slash            = `/`.charCodeAt(0);

export const backslash        = '\\'.charCodeAt(0);
export const cr               = '\r'.charCodeAt(0);
export const feed             = '\f'.charCodeAt(0);
export const newline          = '\n'.charCodeAt(0);
export const tab              = '\t'.charCodeAt(0);

// Expose aliases primarily for readability.
export const combinator       = tilde;
export const str              = singleQuote;

// No good single character representation!
export const comment          = -1;
export const word             = -2;
