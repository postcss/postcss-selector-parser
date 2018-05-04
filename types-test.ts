import * as parser from 'postcss-selector-parser';

const transform: parser.SyncProcessor = selectors => {
    selectors.walk(selector => {
        // do something with the selector
        console.log(String(selector))
    });
};

const transformAsync = selectors => {
    return Promise.resolve().then(() => {
        selectors.walk(selector => {
            // do something with the selector
            console.log(String(selector))
        });
    })
};
const p = parser(transformAsync);

const transformed = p.processSync('h1, h2, h3');