import Processor from "./processor";
import * as selectors from "./selectors";

const parser = (processor?: any, options?: any) => new Processor(processor, options);

Object.assign(parser, selectors);

delete (parser as any).__esModule;

export = parser;
