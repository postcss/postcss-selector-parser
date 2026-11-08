import * as parser from './postcss-selector-parser';

parser(undefined, { lossless: false }).processSync('a > b');
parser(() => {}, { lossless: false }).processSync('a > b');
parser(() => 1, { lossless: false }).transformSync('a > b') satisfies number;
declare const asyncProcessor: parser.AsyncProcessor<number>;
declare const asyncVoidProcessor: parser.AsyncProcessor<void>;
parser(asyncVoidProcessor, { lossless: false }).process('a > b');
parser(asyncProcessor, { lossless: false }).transform('a > b') satisfies Promise<number>;
// @ts-expect-error An async processor cannot be called synchronously.
parser(asyncProcessor, { lossless: false }).processSync('a > b');

parser((root) => {
    root.each((node, index) => {
        node satisfies parser.Selector;
        index satisfies number;
    });
    root.walk((node, index) => {
        node satisfies parser.Node;
        index satisfies number;

        if (node.type === 'selector') {
            node satisfies parser.Selector;
        }
    });
    root.walkUniversals((node) => {
        node satisfies parser.Universal;
    });
}).processSync("a b > c");
