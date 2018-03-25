import Parser from './parser';

export default class Processor {
    constructor (func, options) {
        this.func = func || function noop () {};
        this.funcRes = null;
        this.options = options;
    }

    _shouldUpdateSelector (rule, options = {}) {
        let merged = Object.assign({}, this.options, options);
        if (merged.updateSelector === false) {
            return false;
        } else {
            return typeof rule !== "string";
        }
    }

    _isLossy (options = {}) {
        let merged = Object.assign({}, this.options, options);
        if (merged.lossless === false) {
            return true;
        } else {
            return false;
        }
    }

    _root (rule, options = {}) {
        let parser = new Parser(rule, this._parseOptions(options));
        return parser.root;
    }

    _parseOptions (options) {
        return {
            lossy: this._isLossy(options),
        };
    }

    _run (rule, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                let root = this._root(rule, options);
                Promise.resolve(this.func(root)).then(transform => {
                    let string = undefined;
                    if (this._shouldUpdateSelector(rule, options)) {
                        string = root.toString();
                        rule.selector = string;
                    }
                    return {transform, root, string};
                }).then(resolve, reject);
            } catch (e) {
                reject(e);
                return;
            }
        });
    }

    _runSync (rule, options = {}) {
        let root = this._root(rule, options);
        let transform = this.func(root);
        if (transform && typeof transform.then === "function") {
            throw new Error("Selector processor returned a promise to a synchronous call.");
        }
        let string = undefined;
        if (options.updateSelector && typeof rule !== "string") {
            string = root.toString();
            rule.selector = string;
        }
        return {transform, root, string};
    }

    /**
     * Process rule into a selector AST.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {Promise<parser.Root>} The AST of the selector after processing it.
     */
    ast (rule, options) {
        return this._run(rule, options).then(result => result.root);
    }

    /**
     * Process rule into a selector AST synchronously.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {parser.Root} The AST of the selector after processing it.
     */
    astSync (rule, options) {
        return this._runSync(rule, options).root;
    }

    /**
     * Process a selector into a transformed value asynchronously
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {Promise<any>} The value returned by the processor.
     */
    transform (rule, options) {
        return this._run(rule, options).then(result => result.transform);
    }

    /**
     * Process a selector into a transformed value synchronously.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {any} The value returned by the processor.
     */
    transformSync (rule, options) {
        return this._runSync(rule, options).transform;
    }

    /**
     * Process a selector into a new selector string asynchronously.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {string} the selector after processing.
     */
    process (rule, options) {
        return this._run(rule, options)
            .then((result) => result.string || result.root.toString());
    }

    /**
     * Process a selector into a new selector string synchronously.
     *
     * @param rule {postcss.Rule | string} The css selector to be processed
     * @param options The options for processing
     * @returns {string} the selector after processing.
     */
    processSync (rule, options) {
        let result = this._runSync(rule, options);
        return result.string || result.root.toString();
    }
}
