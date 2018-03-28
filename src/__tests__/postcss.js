import test from 'ava';
import postcss from 'postcss';
import {parse} from './util/helpers';

const cse = 'CssSyntaxError';

function showCode (t, selector) {
    const rule = postcss.parse(selector).first;
    try {
        parse(rule);
    } catch (e) {
        if (e.name !== cse) {
            return;
        }
        // Removes ANSI codes from snapshot tests as it makes them illegible.
        // The formatting of this error is otherwise identical to e.toString()
        t.snapshot(`${cse}: ${e.message}\n\n${e.showSourceCode(false)}\n`);
    }
}

test('missing open square bracket', showCode, 'a b c] {}');
test('missing open parenthesis', showCode, 'a b c) {}');
test('missing pseudo class or pseudo element', showCode, 'a b c: {}');

test('space in between colon and word (incorrect pseudo)', showCode, 'a b: c {}');
test('string after colon (incorrect pseudo)', showCode, 'a b:"wow" {}');

// attribute selectors

test('bad string attribute', showCode, '["hello"] {}');
test('bad string attribute with value', showCode, '["foo"=bar] {}');
test('bad parentheses', showCode, '[foo=(bar)] {}');
test('bad lonely asterisk', showCode, '[*] {}');
test('bad lonely pipe', showCode, '[|] {}');
test('bad lonely caret', showCode, '[^] {}');
test('bad lonely dollar', showCode, '[$] {}');
test('bad lonely tilde', showCode, '[~] {}');
test('bad lonely equals', showCode, '[=] {}');
test('bad lonely operator', showCode, '[*=] {}');
test('bad lonely operator (2)', showCode, '[|=] {}');
test('bad doubled operator', showCode, '[href=foo=bar] {}');
