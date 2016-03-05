import test from 'ava';
import {parse} from './util/helpers';
import parser from '../index';

test('container#each', (t) => {
    let str = '';
    parse('h1, h2:not(h3, h4)', (selectors) => {
        selectors.each((selector) => {
            if (selector.first.type === 'tag') {
                str += selector.first.value;
            }
        });
    });
    t.same(str, 'h1h2');
});

test('container#walk', (t) => {
    let str = '';
    parse('h1, h2:not(h3, h4)', (selectors) => {
        selectors.walk((selector) => {
            if (selector.type === 'tag') {
                str += selector.value;
            }
        });
    });
    t.same(str, 'h1h2h3h4');
});

test('container#walk (safe iteration)', (t) => {
    let out = parse('[class] + *[href] *:not(*.green)', (selectors) => {
        selectors.walkUniversals((selector) => {
            let next = selector.next();
            if (next && next.type !== 'combinator') {
                selector.remove();
            }
        });
    });
    t.same(out, '[class] + [href] :not(.green)');
});

test('container#walkAttribute', (t) => {
    let out = parse('[href][class].class', (selectors) => {
        selectors.walkAttributes((attr) => {
            if (attr.attribute === 'class') {
                attr.remove();
            }
        });
    });
    t.same(out, '[href].class');
});

test('container#walkClass', (t) => {
    let out = parse('.one, .two, .three:not(.four, .five)', (selectors) => {
        selectors.walkClasses((className) => {
            className.value = className.value.slice(0, 1);
        });
    });
    t.same(out, '.o, .t, .t:not(.f, .f)');
});

test('container#walkCombinator', (t) => {
    let out = parse('h1 h2 h3 h4', (selectors) => {
        selectors.walkCombinators((comment) => {
            comment.remove();
        });
    });
    t.same(out, 'h1h2h3h4');
});

test('container#walkComment', (t) => {
    let out = parse('.one/*test*/.two', (selectors) => {
        selectors.walkComments((comment) => {
            comment.remove();
        });
    });
    t.same(out, '.one.two');
});

test('container#walkId', (t) => {
    let out = parse('h1#one, h2#two', (selectors) => {
        selectors.walkIds((id) => {
            id.value = id.value.slice(0, 1);
        });
    });
    t.same(out, 'h1#o, h2#t');
});

test('container#walkPseudo', (t) => {
    let out = parse('a:before, a:after', (selectors) => {
        selectors.walkPseudos((pseudo) => {
            pseudo.value = pseudo.value.slice(0, 2);
        });
    });
    t.same(out, 'a:b, a:a');
});

test('container#walkTag', (t) => {
    let out = parse('1 2 3', (selectors) => {
        selectors.walkTags((tag) => {
            tag.value = 'h' + tag.value;
        });
    });
    t.same(out, 'h1 h2 h3');
});

test('container#walkUniversal', (t) => {
    let out = parse('*.class,*.class,*.class', (selectors) => {
        selectors.walkUniversals((universal) => {
            universal.remove();
        });
    });
    t.same(out, '.class,.class,.class');
});

test('container#map', (t) => {
    parse('1 2 3', (selectors) => {
        let arr = selectors.first.map((selector) => {
            if (/[0-9]/.test(selector.value)) {
                return 'h' + selector.value;
            }
            return selector.value;
        });
        t.same(arr, ['h1', ' ', 'h2', ' ', 'h3']);
    });
});

test('container#every', (t) => {
    parse('.one.two.three', (selectors) => {
        let allClasses = selectors.first.every((selector) => {
            return selector.type = 'class';
        });
        t.ok(allClasses);
    });
});

test('container#some', (t) => {
    parse('one#two.three', (selectors) => {
        let someClasses = selectors.first.some((selector) => {
            return selector.type = 'class';
        });
        t.ok(someClasses);
    });
});

test('container#reduce', (t) => {
    parse('h1, h2, h3, h4', (selectors) => {
        let str = selectors.reduce((memo, selector) => {
            if (selector.first.type === 'tag') {
                memo += selector.first.value;
            }
            return memo;
        }, '');
        t.same(str, 'h1h2h3h4');
    });
});

test('container#filter', (t) => {
    parse('h1, h2, c1, c2', (selectors) => {
        let ast = selectors.filter((selector) => {
            return ~selector.first.value.indexOf('h');
        });
        t.same(String(ast), 'h1, h2');
    });
});

test('container#split', (t) => {
    parse('h1 h2 >> h3', (selectors) => {
        let list = selectors.first.split((selector) => {
            return selector.value === '>>';
        }).map((group) => {
            return group.map(String);
        });
        t.same(list, [['h1', ' ', 'h2', ' >> '], ['h3']]);
        t.same(list.length, 2);
    });
});

test('container#sort', (t) => {
    let out = parse('h2,h3,h1,h4', (selectors) => {
        selectors.sort((a, b) => {
            return a.first.value.slice(-1) - b.first.value.slice(-1);
        });
    });
    t.same(out, 'h1,h2,h3,h4');
});

test('container#at', (t) => {
    parse('h1, h2, h3', (selectors) => {
        t.same(selectors.at(1).first.value, 'h2');
    });
});

test('container#first, container#last', (t) => {
    parse('h1, h2, h3, h4', (selectors) => {
        t.same(selectors.first.first.value, 'h1');
        t.same(selectors.last.last.value, 'h4');
    });
});

test('container#index', (t) => {
    parse('h1 h2 h3', (selectors) => {
        let middle = selectors.first.at(1);
        t.same(selectors.first.index(middle), 1);
    });
});

test('container#length', (t) => {
    parse('h1, h2, h3', (selectors) => {
        t.same(selectors.length, 3);
    });
});

test('container#removeChild', (t) => {
    let out = parse('h1.class h2.class h3.class', (selectors) => {
        selectors.walk((selector) => {
            if (selector.type === 'class') {
                selector.parent.removeChild(selector);
            }
        });
    });
    t.same(out, 'h1 h2 h3');
});

test('container#removeAll, container#empty', (t) => {
    let wipe = (method) => {
        return (selectors) => selectors[method]();
    };
    let out1 = parse('h1 h2, h2 h3, h3 h4', wipe('empty'));
    let out2 = parse('h1 h2, h2 h3, h3 h4', wipe('removeAll'));
    t.same(out1, '');
    t.same(out2, '');
});

test('container#insertBefore', (t) => {
    let out = parse('h2', (selectors) => {
        let selector = selectors.first;
        let clone = selector.first.clone({value: 'h1'});
        selectors.insertBefore(selector, clone);
    });
    t.same(out, 'h1,h2');
});

test('container#insertAfter', (t) => {
    let out = parse('h1', (selectors) => {
        let selector = selectors.first;
        let clone = selector.first.clone({value: 'h2'});
        selectors.insertAfter(selector, clone);
    });
    t.same(out, 'h1,h2');
});

test('container#insertAfter (during iteration)', (t) => {
    let out = parse('h1, h2, h3', (selectors) => {
        selectors.walkTags(selector => {
            let attribute = parser.attribute({attribute: 'class'});
            selector.parent.insertAfter(selector, attribute);
        });
    });
    t.same(out, 'h1[class], h2[class], h3[class]');
});
