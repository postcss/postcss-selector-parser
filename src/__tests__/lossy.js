import ava from 'ava';
import parser from '../index';

export const parse = (input, options, transform) => {
    return parser(transform).process(input, options).result;
};

export const testLossy = (spec, input, expected) => {
    let result = parse(input, {lossless:false});

    ava(`${spec} (toString)`, t => {
        t.deepEqual(result, expected);
    });
};

testLossy('combinator, descendant - single', '.one .two', '.one .two');
testLossy('combinator, descendant - multiple', '.one   .two', '.one .two');
testLossy('combinator, child - space before', '.one >.two', '.one>.two');
testLossy('combinator, child - space after', '.one> .two', '.one>.two');
testLossy('combinator, sibling - space before', '.one ~.two', '.one~.two');
testLossy('combinator, sibling - space after', '.one~ .two', '.one~.two');
testLossy('combinator, adj sibling - space before', '.one +.two', '.one+.two');
testLossy('combinator, adj sibling - space after', '.one+ .two', '.one+.two');

testLossy('classes, extraneous spaces', '  .h1   ,  .h2   ', '.h1,.h2');
testLossy('ids, extraneous spaces', '  #h1   ,  #h2   ', '#h1,#h2');

testLossy('attribute, spaces in selector', 'h1[  href  *=  "test"  ]', 'h1[href*="test"]');
testLossy('attribute, insensitive flag 1', '[href="test" i  ]', '[href="test" i]');
testLossy('attribute, insensitive flag 2', '[href=TEsT i  ]', '[href=TEsT i]');
testLossy('attribute, insensitive flag 3', '[href=test i  ]', '[href=test i]');
testLossy('attribute, extreneous whitespace', '  [href]   ,  [class]   ', '[href],[class]');

testLossy('namespace, space before', '   postcss|button', 'postcss|button');
testLossy('namespace, space after', 'postcss|button     ', 'postcss|button');
testLossy('namespace - all elements, space before', '   postcss|*', 'postcss|*');
testLossy('namespace - all elements, space after', 'postcss|*     ', 'postcss|*');
testLossy('namespace - all namespaces, space before', '   *|button', '*|button');
testLossy('namespace - all namespaces, space after', '*|button     ', '*|button');
testLossy('namespace - all elements in all namespaces, space before', '   *|*', '*|*');
testLossy('namespace - all elements in all namespaces, space after', '*|*     ', '*|*');
testLossy('namespace - all elements without namespace, space before', '   |*', '|*');
testLossy('namespace - all elements without namespace, space after', '|*     ', '|*');
testLossy('namespace - tag with no namespace, space before', '   |button', '|button');
testLossy('namespace - tag with no namespace, space after', '|button     ', '|button');
testLossy('namespace - inside attribute, space before', ' [  postcss|href=test]', '[postcss|href=test]');
testLossy('namespace - inside attribute, space after', '[postcss|href=  test  ] ', '[postcss|href=test]');
testLossy('namespace - inside attribute (2), space before', ' [  postcss|href]', '[postcss|href]');
testLossy('namespace - inside attribute (2), space after', '[postcss|href ] ', '[postcss|href]');
testLossy('namespace - inside attribute (3), space before', ' [  *|href=test]', '[*|href=test]');
testLossy('namespace - inside attribute (3), space after', '[*|href=  test  ] ', '[*|href=test]');
testLossy('namespace - inside attribute (4), space before', ' [  |href=test]', '[|href=test]');
testLossy('namespace - inside attribute (4), space after', '[|href=  test  ] ', '[|href=test]');

testLossy('tag - extraneous whitespace', '  h1   ,  h2   ', 'h1,h2');
testLossy('tag - trailing comma', 'h1, ', 'h1,');
testLossy('tag - trailing comma (1)', 'h1,', 'h1,');
testLossy('tag - trailing comma (2)', 'h1', 'h1');
testLossy('tag - trailing slash (1)', 'h1\\    ', 'h1\\');
testLossy('tag - trailing slash (2)', 'h1\\    h2\\', 'h1\\ h2\\');

testLossy('universal - combinator', ' * + * ', '*+*');
testLossy('universal - extraneous whitespace', '  *   ,  *   ', '*,*');
testLossy('universal - qualified universal selector', '*[href] *:not(*.green)', '*[href] *:not(*.green)');

testLossy('nesting - spacing before', '  &.class', '&.class');
testLossy('nesting - spacing after', '&.class  ', '&.class');
testLossy('nesting - spacing between', '&  .class  ', '&.class');

testLossy('pseudo (single) - spacing before', '  :after', ':after');
testLossy('pseudo (single) - spacing after', ':after  ', ':after');
testLossy('pseudo (double) - spacing before', '  ::after', '::after');
testLossy('pseudo (double) - spacing after', '::after  ', '::after');
testLossy('pseudo - multiple', ' *:target::before ,   a:after  ', '*:target::before,a:after');
testLossy('pseudo - negated', 'h1:not( .heading )', 'h1:not(.heading)');
testLossy('pseudo - negated with combinators (1)', 'h1:not(.heading > .title)   >  h1', 'h1:not(.heading>.title)>h1');
testLossy('pseudo - negated with combinators (2)', '.foo:nth-child(2n + 1)', '.foo:nth-child(2n+1)');
testLossy('pseudo - extra whitespace', 'a:not(   h2   )', 'a:not(h2)');

testLossy('@words - space before', '  @media', '@media');
testLossy('@words - space after', '@media  ', '@media');
testLossy('@words - maintains space between', '@media (min-width: 700px) and (orientation: landscape)', '@media (min-width: 700px) and (orientation: landscape)');
testLossy('@words - extraneous space between', '@media  (min-width:  700px)  and   (orientation:   landscape)', '@media (min-width: 700px) and (orientation: landscape)');
