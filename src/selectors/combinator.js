import Node from "./node";
import { COMBINATOR } from "./types";

export default class Combinator extends Node {
  constructor(opts) {
    super(opts);
    this.type = COMBINATOR;
    this._constructed = true;
  }

  set value(value) {
    if (this._constructed && this.raws) {
      delete this.raws.value;
    }
    this._value = value;
  }

  get value() {
    return this._value;
  }
}
