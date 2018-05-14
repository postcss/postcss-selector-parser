import test from 'ava';
import parser from '../index';

// Node creation
const nodeTypes = [
    ['attribute',  '[href]', {attribute: 'href'}],
    ['className',  '.classy', {value: 'classy'}],
    ['combinator', ' >> ', {value: '>>', spaces: {before: ' ', after: ' '}}],
    ['comment',    '/* comment */', {value: '/* comment */'}],
    ['id',         '#test', {value: 'test'}],
    ['nesting',    '&'],
    ['pseudo',     '::before', {value: '::before'}],
    ['string',     '"wow"', {value: '"wow"'}],
    ['tag',        'button', {value: 'button'}],
    ['universal',  '*'],
];

nodeTypes.forEach(type => {
    test(`parser#${type[0]}`, t => {
        let node = parser[type[0]](type[2] || {});
        t.deepEqual(String(node), type[1]);
    });
});

test('string constants', t => {
    t.truthy(parser.TAG);
    t.truthy(parser.STRING);
    t.truthy(parser.SELECTOR);
    t.truthy(parser.ROOT);
    t.truthy(parser.PSEUDO);
    t.truthy(parser.NESTING);
    t.truthy(parser.ID);
    t.truthy(parser.COMMENT);
    t.truthy(parser.COMBINATOR);
    t.truthy(parser.CLASS);
    t.truthy(parser.ATTRIBUTE);
    t.truthy(parser.UNIVERSAL);
});

test('construct a whole tree', (t) => {
    let root = parser.root();
    let selector = parser.selector();
    selector.append(parser.id({value: 'tree'}));
    root.append(selector);
    t.deepEqual(String(root), '#tree');
});

test('no operation', (t) => {
    t.notThrows(() => parser().processSync('h1 h2 h3'));
});

test('empty selector string', (t) => {
    t.notThrows(() => {
        return parser((selectors) => {
            selectors.walk((selector) => {
                selector.type = 'tag';
            });
        }).processSync('');
    });
});

test('async parser', (t) => {
    return parser((selectors) => new Promise((res) => {
        setTimeout(() => {
            selectors.first.nodes[0].value = 'bar';
            res();
        }, 1);
    })).process('foo').then((result) => {
        t.deepEqual(result, 'bar');
    });
});

test('parse errors with the async parser', (t) => {
    return parser((selectors) => new Promise((res) => {
        setTimeout(() => {
            selectors.first.nodes[0].value = 'bar';
            res();
        }, 1);
    })).process('a b: c').catch(err => t.truthy(err));
});

test('parse errors within the async processor', (t) => {
    return parser((selectors) => new Promise((res, rej) => {
        setTimeout(() => {
            rej(selectors.error("async error"));
        }, 1);
    })).process('.foo').catch(err => t.truthy(err));
});

test('parse errors within the async processor before the promise returns', (t) => {
    return parser((selectors) => {
        throw selectors.error("async error");
    }).process('.foo').catch(err => t.truthy(err));
});

test('returning a promise to the sync processor fails', (t) => {
    t.throws(() => {
        return parser(() => new Promise((res) => {
            setTimeout(() => {
                res();
            }, 1);
        })).processSync('.foo');
    });
});

test('Passing a rule works async', (t) => {
    let rule = {selector: '.foo'};
    return parser((root) => new Promise((res) => {
        setTimeout(() => {
            root.walkClasses((node) => {
                node.value = "bar";
            });
            res();
        }, 1);
    })).process(rule)
        .then(newSel => {
            t.deepEqual(newSel, ".bar");
            t.deepEqual(rule.selector, ".bar");
        });
});

test('Passing a rule with mutation disabled works async', (t) => {
    let rule = {selector: '.foo'};
    return parser((root) => new Promise((res) => {
        setTimeout(() => {
            root.walkClasses((node) => {
                node.value = "bar";
            });
            res();
        }, 1);
    })).process(rule, {updateSelector: false})
        .then(newSel => {
            t.deepEqual(newSel, ".bar");
            t.deepEqual(rule.selector, ".foo");
        });
});

test('Passing a rule with mutation works sync', (t) => {
    let rule = {selector: '.foo'};
    let newSel = parser((root) => {
        root.walkClasses((node) => {
            node.value = "bar";
        });
    }).processSync(rule, {updateSelector: true});
    t.deepEqual(newSel, ".bar");
    t.deepEqual(rule.selector, ".bar");
});

test('Transform a selector synchronously', (t) => {
    let rule = {selector: '.foo'};
    let count = parser((root) => {
        let classCount = 0;
        root.walkClasses((node) => {
            classCount++;
            node.value = "bar";
        });
        return classCount;
    }).transformSync(rule, {updateSelector: true});
    t.deepEqual(count, 1);
    t.deepEqual(rule.selector, ".bar");
});

test('Transform a selector asynchronously', (t) => {
    let rule = {selector: '.foo'};
    return parser((root) => new Promise(res => {
        setTimeout(() => {
            let classCount = 0;
            root.walkClasses((node) => {
                classCount++;
                node.value = "bar";
            });
            res(classCount);
        }, 1);
    })).transform(rule, {updateSelector: true}).then(count => {
        t.deepEqual(count, 1);
        t.deepEqual(rule.selector, ".bar");
    });
});

test('get AST of a selector synchronously', (t) => {
    let rule = {selector: '.foo'};
    let ast = parser((root) => {
        let classCount = 0;
        root.walkClasses((node) => {
            classCount++;
            node.value = "bar";
        });
        return classCount;
    }).astSync(rule, {updateSelector: true});
    t.deepEqual(ast.nodes[0].nodes[0].value, "bar");
    t.deepEqual(rule.selector, ".bar");
});

test('get AST a selector asynchronously', (t) => {
    let rule = {selector: '.foo'};
    return parser((root) => new Promise(res => {
        setTimeout(() => {
            let classCount = 0;
            root.walkClasses((node) => {
                classCount++;
                node.value = "bar";
            });
            res(classCount);
        }, 1);
    })).ast(rule, {updateSelector: true}).then(ast => {
        t.deepEqual(ast.nodes[0].nodes[0].value, "bar");
        t.deepEqual(rule.selector, ".bar");
    });
});
