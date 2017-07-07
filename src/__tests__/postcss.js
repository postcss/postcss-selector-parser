import test from 'ava';
import postcss from 'postcss';
import {parse} from './util/helpers';

function showCode (t, selector) {
    const rule = postcss.parse(selector).first;
    try {
        parse(rule);
    } catch (e) {
        t.snapshot(e.toString());
    }
}

test('missing open square bracket', showCode, 'a b c] {}');
test('missing open parenthesis', showCode, 'a b c) {}');
test('missing pseudo class or pseudo element', showCode, 'a b c: {}');

test('space in between colon and word (incorrect pseudo)', showCode, 'a b: c {}');
test('string after colon (incorrect pseudo)', showCode, 'a b:"wow" {}');
