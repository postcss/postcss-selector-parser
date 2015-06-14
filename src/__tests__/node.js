import test from 'tape';
import {parse} from './util/helpers';
import parser from '../index';

test('node#clone', (t) => {
    t.plan(1);
    parse('[href="test"]', (selectors) => {
        let selector = selectors.first.first;
        let clone = selector.clone();
        delete selector.parent;
        t.deepEqual(clone, selectors.first.first);
    });
});

test('node#replaceWith', (t) => {
    t.plan(1);
    let out = parse('[href="test"]', (selectors) => {
        let attr = selectors.first.first;
        let className = parser.className({value: 'test'});
        attr.replaceWith(className);
    });
    t.equal(out, '.test');
});
