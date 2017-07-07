import Parser from './parser';

export default class Processor {
    constructor (func) {
        this.func = func || function noop () {};
        this.funcRes = null;
        return this;
    }

    _input (rule, options = {}) {
        return new Parser({
            css: rule,
            error: (e, opts) => {
                if (typeof rule === 'string') {
                    throw new Error(e);
                }
                throw rule.error(e, opts); // eslint-disable-line new-cap
            },
            options,
        });
    }

    process (rule, options) {
        let input;
        try {
            input = this._input(rule, options);
        } catch (e) {
            return Promise.reject(e);
        }
        return Promise.resolve(this.func(input)).then(() => String(input));
    }

    processSync (rule, options = {}) {
        const input = this._input(rule, options);
        this.func(input);
        return String(input);
    }
}
