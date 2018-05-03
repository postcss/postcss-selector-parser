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

test('node#clone of attribute', (t) => {
    parse('[href=test]', (selectors) => {
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

test('Node#isAtPosition', (t) => {
    parse(':not(.foo),\n#foo > :matches(ol, ul)', (root) => {
        t.deepEqual(root.isAtPosition(1, 1), true);
        t.deepEqual(root.isAtPosition(1, 10), true);
        t.deepEqual(root.isAtPosition(2, 23), true);
        t.deepEqual(root.isAtPosition(2, 24), false);
        let selector = root.first;
        t.deepEqual(selector.isAtPosition(1, 1), true);
        t.deepEqual(selector.isAtPosition(1, 10), true);
        t.deepEqual(selector.isAtPosition(1, 11), false);
        let pseudoNot = selector.first;
        t.deepEqual(pseudoNot.isAtPosition(1, 1), true);
        t.deepEqual(pseudoNot.isAtPosition(1, 7), true);
        t.deepEqual(pseudoNot.isAtPosition(1, 10), true);
        t.deepEqual(pseudoNot.isAtPosition(1, 11), false);
        let notSelector = pseudoNot.first;
        t.deepEqual(notSelector.isAtPosition(1, 1), false);
        t.deepEqual(notSelector.isAtPosition(1, 4), false);
        t.deepEqual(notSelector.isAtPosition(1, 5), true);
        t.deepEqual(notSelector.isAtPosition(1, 6), true);
        t.deepEqual(notSelector.isAtPosition(1, 9), true);
        t.deepEqual(notSelector.isAtPosition(1, 10), true);
        t.deepEqual(notSelector.isAtPosition(1, 11), false);
        let notClass = notSelector.first;
        t.deepEqual(notClass.isAtPosition(1, 5), false);
        t.deepEqual(notClass.isAtPosition(1, 6), true);
        t.deepEqual(notClass.isAtPosition(1, 9), true);
        t.deepEqual(notClass.isAtPosition(1, 10), false);
        let secondSel = root.at(1);
        t.deepEqual(secondSel.isAtPosition(1, 11), false);
        t.deepEqual(secondSel.isAtPosition(2, 1), true);
        t.deepEqual(secondSel.isAtPosition(2, 23), true);
        t.deepEqual(secondSel.isAtPosition(2, 24), false);
        let combinator = secondSel.at(1);
        t.deepEqual(combinator.isAtPosition(2, 5), false);
        t.deepEqual(combinator.isAtPosition(2, 6), true);
        t.deepEqual(combinator.isAtPosition(2, 7), false);
    });
});
