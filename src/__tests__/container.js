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
