import {throws} from './util/helpers';

// Unclosed elements
throws('unclosed string', 'a[href="wow]');
throws('unclosed comment', '/* oops');
throws('unclosed pseudo element', 'button::');
throws('unclosed pseudo class', 'a:');
throws('unclosed attribute selector', '[name="james"][href');

throws('bad pseudo element', 'button::"after"');
throws('missing closing parenthesis in pseudo', ':not([attr="test"]:not([attr="test"])');
