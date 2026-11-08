import Container from "./container";
import { ROOT } from "./types";

export default class Root extends Container {
  constructor(opts) {
    super(opts);
    this.type = ROOT;
  }

  _stringify(options, depth, max) {
    let str = this.reduce((memo, selector) => {
      memo.push(this._stringifyChild(selector, options, depth, max));
      return memo;
    }, []).join(",");
    if (this.trailingComma) {
      str += ",";
    }
    return [this.rawSpaceBefore, str, this.rawSpaceAfter].join("");
  }

  error(message, options) {
    if (this._error) {
      return this._error(message, options);
    } else {
      return new Error(message);
    }
  }

  set errorGenerator(handler) {
    this._error = handler;
  }
}
