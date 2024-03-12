import * as parser from './postcss-selector-parser';

parser((root) => {
    root.each((node, index) => {
        node as parser.Selector;
        index as number;
    });
    root.walk((node, index) => {
        node as parser.Selector;
        index as number;
    });
}).processSync("a b > c");
