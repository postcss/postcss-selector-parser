import Parser from './parser';

export default class Processor {
    constructor (func) {
        this.func = func || function noop () {};
        return this;
    }

    process (selectors, options = {}) {
        let input = new Parser({
            css: selectors,
            error: (e) => {
                throw new Error(e);
            },
            options: options,
        });
        this.res = input;
        this.func(input);
        return this;
    }

    get result () {
        return String(this.res);
    }
}
