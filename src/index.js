import Processor  from './processor';
import Attribute  from './selectors/attribute';
import ClassName  from './selectors/className';
import Combinator from './selectors/combinator';
import Comment    from './selectors/comment';
import Id         from './selectors/id';
import Nesting    from './selectors/nesting';
import Pseudo     from './selectors/pseudo';
import Root       from './selectors/root';
import Selector   from './selectors/selector';
import Str        from './selectors/string';
import Tag        from './selectors/tag';
import Universal  from './selectors/universal';
import * as types from './selectors/types';

let parser = processor => new Processor(processor);

parser.attribute = opts => new Attribute(opts);
parser.className = opts => new ClassName(opts);
parser.combinator = opts => new Combinator(opts);
parser.comment = opts => new Comment(opts);
parser.id = opts => new Id(opts);
parser.nesting = opts => new Nesting(opts);
parser.pseudo = opts => new Pseudo(opts);
parser.root = opts => new Root(opts);
parser.selector = opts => new Selector(opts);
parser.string = opts => new Str(opts);
parser.tag = opts => new Tag(opts);
parser.universal = opts => new Universal(opts);

Object.keys(types).forEach(type => {
    if (type === '__esModule') {
        return;
    }
    parser[type] = types[type];
});

export default parser;
