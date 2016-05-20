import test from 'ava';
import parser from '../index';

// Node creation
const nodeTypes = [
    ['attribute',  '[href]', {attribute: 'href'}],
    ['className',  '.classy', {value: 'classy'}],
    ['combinator', '>>', {value: '>>'}],
    ['comment',    '/* comment */', {value: '/* comment */'}],
    ['id',         '#test', {value: 'test'}],
    ['nesting',    '&'],
    ['pseudo',     '::before', {value: '::before'}],
    ['string',     '"wow"', {value: '"wow"'}],
    ['tag',        'button', {value: 'button'}],
    ['universal',  '*']
];

nodeTypes.forEach(type => {
    test(`parser#${type[0]}`, t => {
        let node = parser[type[0]](type[2] || {});
        t.deepEqual(String(node), type[1]);
    });
});

test('construct a whole tree', (t) => {
    let root = parser.root();
    let selector = parser.selector();
    selector.append(parser.id({value: 'tree'}));
    root.append(selector);
    t.deepEqual(String(root), '#tree');
});

test('no operation', (t) => {
    t.notThrows(() => parser().process('h1 h2 h3').result);
});

test('empty selector string', (t) => {
    t.notThrows(() => {
        return parser((selectors) => {
            selectors.walk((selector) => {
                selector.type = 'tag';
            });
        }).process('').result;
    });
});

test('async parser', (t) => {
    t.plan(1);

    t.notThrows(() => {
        return parser(() => new Promise((res) => {
            res();
        })).process('').result.then(() => {
            t.pass();
        });
    });
});
