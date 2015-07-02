'use strict';

import {throws} from './util/helpers';

throws('unclosed pseudo element', 'button::');
throws('bad pseudo element', 'button::"after"');
throws('incorrect combinator with no left hand side', '+ h1');
throws('incorrect combinator with no right hand side', 'h1 +');
throws('unclosed attribute selector', '[name="james"][href');
throws('missing closing parenthesis in pseudo', ':not([attr="test"]:not([attr="test"])');
