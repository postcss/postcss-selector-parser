import test from 'tape';
import {parse} from './util/helpers';

test('node#clone', (t) => {
    t.plan(1);
    parse('[href="test"]', (selectors) => {
        let selector = selectors.first.first;
        let clone = selector.clone();
        delete selector.parent;
        t.deepEqual(clone, selectors.first.first);
    });
});
