import Processor  from './processor';
import * as selectors from './selectors';

const parser = processor => new Processor(processor);

Object.assign(parser, selectors);

delete parser.__esModule;

export default parser;
