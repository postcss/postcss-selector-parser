import test from 'tape';
import {parse} from './util/helpers';

test('container#each', (t) => {
    t.plan(1);
    let str = '';
    parse('h1, h2:not(h3, h4)', (selectors) => {
        selectors.each((selector) => {
            if (selector.first.type === 'tag') {
                str += selector.first.value;
            }
        });
    });
    t.equal(str, 'h1h2');
});

test('container#eachInside', (t) => {
    t.plan(1);
    let str = '';
    parse('h1, h2:not(h3, h4)', (selectors) => {
        selectors.eachInside((selector) => {
            if (selector.type === 'tag') {
                str += selector.value;
            }
        });
    });
    t.equal(str, 'h1h2h3h4');
});

test('container#eachAttribute', (t) => {
    t.plan(1);
    let out = parse('[href][class].class', (selectors) => {
        selectors.eachAttribute((attr) => {
            if (attr.attribute === 'class') {
                attr.removeSelf();
            }
        });
    });
    t.equal(out, '[href].class');
});

test('container#eachClass', (t) => {
    t.plan(1);
    let out = parse('.one, .two, .three:not(.four, .five)', (selectors) => {
        selectors.eachClass((className) => {
            className.value = className.value.slice(0, 1);
        });
    });
    t.equal(out, '.o, .t, .t:not(.f, .f)');
});

test('container#eachComment', (t) => {
    t.plan(1);
    let out = parse('.one/*test*/.two', (selectors) => {
        selectors.eachComment((comment) => {
            comment.removeSelf();
        });
    });
    t.equal(out, '.one.two');
});

test('container#eachId', (t) => {
    t.plan(1);
    let out = parse('h1#one, h2#two', (selectors) => {
        selectors.eachId((id) => {
            id.value = id.value.slice(0, 1);
        });
    });
    t.equal(out, 'h1#o, h2#t');
});

test('container#eachPseudo', (t) => {
    t.plan(1);
    let out = parse('a:before, a:after', (selectors) => {
        selectors.eachPseudo((pseudo) => {
            pseudo.value = pseudo.value.slice(0, 2);
        });
    });
    t.equal(out, 'a:b, a:a');
});

test('container#eachTag', (t) => {
    t.plan(1);
    let out = parse('1 2 3', (selectors) => {
        selectors.eachTag((tag) => {
            tag.value = 'h' + tag.value;
        });
    });
    t.equal(out, 'h1 h2 h3');
});

test('container#eachUniversal', (t) => {
    t.plan(1);
    let out = parse('*.class,*.class,*.class', (selectors) => {
        selectors.eachUniversal((universal) => {
            universal.removeSelf();
        });
    });
    t.equal(out, '.class,.class,.class');
});

test('container#map', (t) => {
    t.plan(1);
    parse('1 2 3', (selectors) => {
        let arr = selectors.first.map((selector) => {
            if (/[0-9]/.test(selector.value)) {
                return 'h' + selector.value;
            }
            return selector.value;
        });
        t.deepEqual(arr, ['h1', ' ', 'h2', ' ', 'h3']);
    });
});

test('container#every', (t) => {
    t.plan(1);
    parse('.one.two.three', (selectors) => {
        let allClasses = selectors.first.every((selector) => {
            return selector.type = 'class';
        });
        t.ok(allClasses);
    });
});

test('container#some', (t) => {
    t.plan(1);
    parse('one#two.three', (selectors) => {
        let someClasses = selectors.first.some((selector) => {
            return selector.type = 'class';
        });
        t.ok(someClasses);
    });
});

test('container#reduce', (t) => {
    t.plan(1);
    parse('h1, h2, h3, h4', (selectors) => {
        let str = selectors.reduce((memo, selector) => {
            if (selector.first.type === 'tag') {
                memo += selector.first.value;
            }
            return memo;
        }, '');
        t.equal(str, 'h1h2h3h4');
    });
});

test('container#filter', (t) => {
    t.plan(1);
    parse('h1, h2, c1, c2', (selectors) => {
        let ast = selectors.filter((selector) => {
            return ~selector.first.value.indexOf('h');
        });
        t.equal(String(ast), 'h1, h2');
    });
});

test('container#at', (t) => {
    t.plan(1);
    parse('h1, h2, h3', (selectors) => {
        t.equal(selectors.at(1).first.value, 'h2');
    });
});

test('container#first, container#last', (t) => {
    t.plan(2);
    parse('h1, h2, h3, h4', (selectors) => {
        t.equal(selectors.first.first.value, 'h1');
        t.equal(selectors.last.last.value, 'h4');
    });
});

test('container#index', (t) => {
    t.plan(1);
    parse('h1 h2 h3', (selectors) => {
        let middle = selectors.first.at(1);
        t.equal(selectors.first.index(middle), 1);
    });
});

test('container#length', (t) => {
    t.plan(1);
    parse('h1, h2, h3', (selectors) => {
        t.equal(selectors.length, 3);
    });
});

test('container#remove', (t) => {
    t.plan(1);
    let out = parse('h1.class h2.class h3.class', (selectors) => {
        selectors.eachInside((selector) => {
            if (selector.type === 'class') {
                selector.parent.remove(selector);
            }
        });
    });
    t.equal(out, 'h1 h2 h3');
});

test('container#removeAll, container#empty', (t) => {
    t.plan(2);
    let wipe = (method) => { return (selectors) => { selectors[method](); } };
    let out1 = parse('h1 h2, h2 h3, h3 h4', wipe('empty'));
    let out2 = parse('h1 h2, h2 h3, h3 h4', wipe('removeAll'));
    t.equal(out1, '');
    t.equal(out2, '');
});
