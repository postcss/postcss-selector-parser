import Parser from './parser';

export default class Processor {
    constructor (func) {
        this.func = func || function noop () {};
        this.funcRes = null;
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
        this.funcRes = this.func(input);
        return this;
    }

    get result () {
        let isPromise = this.funcRes &&
            typeof this.funcRes.then === 'function';

        if (isPromise) {
            return this.funcRes.then(() => String(this.res));
        }
        return String(this.res);
    }
}
