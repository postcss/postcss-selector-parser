import test from './util/runner.mjs';
import postcss from 'postcss';
import {parse} from './util/helpers.mjs';

const cse = 'CssSyntaxError';

// Each case parses an invalid selector embedded in a postcss Rule and asserts
// the rendered CssSyntaxError (message + source-code pointer). ANSI codes are
// stripped via showSourceCode(false) to keep the expected strings legible.
function showCode (t, selector, expected) {
    const rule = postcss.parse(selector).first;
    try {
        parse(rule);
        t.fail(`expected \`${selector}\` to throw a ${cse}`);
    } catch (e) {
        if (e.name !== cse) {
            throw e;
        }
        const actual = `${cse}: ${e.message}\n\n${e.showSourceCode(false)}\n`;
        t.is(actual, expected);
    }
}

test("missing open square bracket", showCode, "a b c] {}", "CssSyntaxError: <css input>:1:6: Expected an opening square bracket.\n\n> 1 | a b c] {}\n    |      ^\n");
test("missing open parenthesis", showCode, "a b c) {}", "CssSyntaxError: <css input>:1:6: Expected an opening parenthesis.\n\n> 1 | a b c) {}\n    |      ^\n");
test("missing pseudo class or pseudo element", showCode, "a b c: {}", "CssSyntaxError: <css input>:1:6: Expected a pseudo-class or pseudo-element.\n\n> 1 | a b c: {}\n    |      ^\n");
test("space in between colon and word (incorrect pseudo)", showCode, "a b: c {}", "CssSyntaxError: <css input>:1:5: Expected a pseudo-class or pseudo-element.\n\n> 1 | a b: c {}\n    |     ^\n");
test("string after colon (incorrect pseudo)", showCode, "a b:\"wow\" {}", "CssSyntaxError: <css input>:1:5: Expected a pseudo-class or pseudo-element.\n\n> 1 | a b:\"wow\" {}\n    |     ^\n");
test("bad string attribute", showCode, "[\"hello\"] {}", "CssSyntaxError: <css input>:1:2: Expected an attribute.\n\n> 1 | [\"hello\"] {}\n    |  ^\n");
test("bad string attribute with value", showCode, "[\"foo\"=bar] {}", "CssSyntaxError: <css input>:1:2: Expected an attribute followed by an operator preceding the string.\n\n> 1 | [\"foo\"=bar] {}\n    |  ^\n");
test("bad parentheses", showCode, "[foo=(bar)] {}", "CssSyntaxError: <css input>:1:6: Unexpected \"(\" found.\n\n> 1 | [foo=(bar)] {}\n    |      ^\n");
test("bad lonely asterisk", showCode, "[*] {}", "CssSyntaxError: <css input>:1:2: Expected an attribute.\n\n> 1 | [*] {}\n    |  ^\n");
test("bad lonely pipe", showCode, "[|] {}", "CssSyntaxError: <css input>:1:2: Expected an attribute.\n\n> 1 | [|] {}\n    |  ^\n");
test("bad lonely caret", showCode, "[^] {}", "CssSyntaxError: <css input>:1:2: Expected an attribute.\n\n> 1 | [^] {}\n    |  ^\n");
test("bad lonely dollar", showCode, "[$] {}", "CssSyntaxError: <css input>:1:2: Expected an attribute.\n\n> 1 | [$] {}\n    |  ^\n");
test("bad lonely tilde", showCode, "[~] {}", "CssSyntaxError: <css input>:1:2: Expected an attribute.\n\n> 1 | [~] {}\n    |  ^\n");
test("bad lonely equals", showCode, "[=] {}", "CssSyntaxError: <css input>:1:2: Expected an attribute.\n\n> 1 | [=] {}\n    |  ^\n");
test("bad lonely operator", showCode, "[*=] {}", "CssSyntaxError: <css input>:1:3: Expected an attribute, found \"=\" instead.\n\n> 1 | [*=] {}\n    |   ^\n");
test("bad lonely operator (2)", showCode, "[|=] {}", "CssSyntaxError: <css input>:1:3: Expected an attribute, found \"=\" instead.\n\n> 1 | [|=] {}\n    |   ^\n");
test("bad doubled operator", showCode, "[href=foo=bar] {}", "CssSyntaxError: <css input>:1:10: Unexpected \"=\" found; an operator was already defined.\n\n> 1 | [href=foo=bar] {}\n    |          ^\n");
