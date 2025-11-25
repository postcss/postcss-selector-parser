import * as parser from './postcss-selector-parser';

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
