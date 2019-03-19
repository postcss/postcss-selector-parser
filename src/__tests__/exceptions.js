import {throws} from './util/helpers';

// Unclosed elements
throws('unclosed string', 'a[href="wow]', 'Unclosed quote');
throws('unclosed comment', '/* oops', 'Unclosed comment');
throws('unclosed pseudo element', 'button::', 'Expected a pseudo-class or pseudo-element.');
throws('unclosed pseudo class', 'a:', 'Expected a pseudo-class or pseudo-element.');
throws('unclosed attribute selector', '[name', 'Expected a closing square bracket.');
throws('unclosed attribute selector (2)', '[name=', 'Expected a closing square bracket.');
throws('unclosed attribute selector (3)', '[name="james"', 'Expected a closing square bracket.');
throws('unclosed attribute selector (4)', '[name="james"][href', 'Expected a closing square bracket.');
throws('unclosed attribute selector (5)', '[name="james"][href', 'Expected a closing square bracket.');

throws('invalid attribute selector', '[]', 'Expected an attribute.');
throws('invalid attribute selector (2)', '["hello"]', 'Expected an attribute.');
throws('invalid attribute selector (3)', '[="hello"]', 'Expected an attribute, found "=" instead.');

throws('no opening parenthesis', ')', 'Expected an opening parenthesis.');
throws('no opening parenthesis (2)', ':global.foo)', 'Expected an opening parenthesis.');
throws('no opening parenthesis (3)', 'h1:not(h2:not(h3)))', 'Expected an opening parenthesis.');

throws('no opening square bracket', ']', 'Expected an opening square bracket.');
throws('no opening square bracket (2)', ':global.foo]', 'Expected an opening square bracket.');
throws('no opening square bracket (3)', '[global]]', 'Expected an opening square bracket.');

throws('bad pseudo element', 'button::"after"', 'Expected a pseudo-class or pseudo-element.');
throws('missing closing parenthesis in pseudo', ':not([attr="test"]:not([attr="test"])', 'Expected a closing parenthesis.');

throws('bad syntax', '-moz-osx-font-smoothing: grayscale', 'Expected a pseudo-class or pseudo-element.');
throws('bad syntax (2)', '! .body', 'Unexpected \'!\'. Escaping special characters with \\ may help.');

throws('missing backslash for semicolon', '.;');
throws('missing backslash for semicolon (2)', '.\;');
throws('unexpected / foo', '-Option\/root', "Unexpected '/'. Escaping special characters with \\ may help.");
throws('bang in selector', '.foo !optional', "Unexpected '!'. Escaping special characters with \\ may help.");

throws('misplaced parenthesis', ':not(', 'Expected a closing parenthesis.');
throws('misplaced parenthesis (2)', ':not)', 'Expected an opening parenthesis.');
throws('misplaced parenthesis (3)', ':not((', 'Expected a closing parenthesis.');
throws('misplaced parenthesis (4)', ':not))', 'Expected an opening parenthesis.');
