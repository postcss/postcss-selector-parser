'use strict';

import {throws} from './util/helpers';

throws('unclosed pseudo element', 'button::');
throws('unclosed pseudo class', 'a:');
throws('bad pseudo element', 'button::"after"');
throws('unclosed attribute selector', '[name="james"][href');
throws('missing closing parenthesis in pseudo', ':not([attr="test"]:not([attr="test"])');
