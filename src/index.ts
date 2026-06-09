import Processor from './processor';
import * as selectors from './selectors';

const parser = (processor?: any) => new Processor(processor);

Object.assign(parser, selectors);

delete (parser as any).__esModule;

export = parser;
