import test from 'ava';
import parser from '..';
import {parse} from './util/helpers';

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

test('Node#appendToPropertyAndEscape', (t) => {
    let out = parse('.fo\\o', (selectors) => {
        let className = selectors.first.first;
        t.deepEqual(className.raws, {value: "fo\\o"});
        className.appendToPropertyAndEscape("value", "bar", "ba\\r");
        t.deepEqual(className.raws, {value: "fo\\oba\\r"});
    });
    t.deepEqual(out, '.fo\\oba\\r');
});

test('Node#setPropertyAndEscape with existing raws', (t) => {
    let out = parse('.fo\\o', (selectors) => {
        let className = selectors.first.first;
        t.deepEqual(className.raws, {value: "fo\\o"});
        className.setPropertyAndEscape("value", "bar", "ba\\r");
        t.deepEqual(className.raws, {value: "ba\\r"});
    });
    t.deepEqual(out, '.ba\\r');
});

test('Node#setPropertyAndEscape without existing raws', (t) => {
    let out = parse('.foo', (selectors) => {
        let className = selectors.first.first;
        t.deepEqual(className.raws, undefined);
        className.setPropertyAndEscape("value", "bar", "ba\\r");
        t.deepEqual(className.raws, {value: "ba\\r"});
    });
    t.deepEqual(out, '.ba\\r');
});

test('Node#setPropertyWithoutEscape with existing raws', (t) => {
    let out = parse('.fo\\o', (selectors) => {
        let className = selectors.first.first;
        t.deepEqual(className.raws, {value: "fo\\o"});
        className.setPropertyWithoutEscape("value", "w+t+f");
        t.deepEqual(className.raws, {});
    });
    t.deepEqual(out, '.w+t+f');
});

test('Node#setPropertyWithoutEscape without existing raws', (t) => {
    let out = parse('.foo', (selectors) => {
        let className = selectors.first.first;
        t.deepEqual(className.raws, undefined);
        className.setPropertyWithoutEscape("value", "w+t+f");
        t.deepEqual(className.raws, {});
        t.deepEqual(className.value, "w+t+f");
    });
    t.deepEqual(out, '.w+t+f');
});
