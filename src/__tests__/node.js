import test from 'ava';
import {parse} from './util/helpers';
import parser from '../index';

test('node#clone', (t) => {
    parse('[href="test"]', (selectors) => {
        let selector = selectors.first.first;
        let clone = selector.clone();
        delete selector.parent;
        t.deepEqual(clone, selectors.first.first);
    });
});

test('node#replaceWith', (t) => {
    let out = parse('[href="test"]', (selectors) => {
        let attr = selectors.first.first;
        let id = parser.id({value: 'test'});
        let className = parser.className({value: 'test'});
        attr.replaceWith(id, className);
    });
    t.deepEqual(out, '#test.test');
});
