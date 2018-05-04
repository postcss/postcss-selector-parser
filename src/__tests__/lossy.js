import ava from 'ava';
import parser from '../index';

export const parse = (input, options, transform) => {
    return parser(transform).processSync(input, options);
};

export const testLossy = (t, input, expected) => {
    let result = parse(input, {lossless:false});
    t.deepEqual(result, expected);
};

ava('combinator, descendant - single', testLossy, '.one .two', '.one .two');
ava('combinator, descendant - multiple', testLossy, '.one   .two', '.one .two');
ava('combinator, child - space before', testLossy, '.one >.two', '.one>.two');
ava('combinator, child - space after', testLossy, '.one> .two', '.one>.two');
ava('combinator, sibling - space before', testLossy, '.one ~.two', '.one~.two');
ava('combinator, sibling - space after', testLossy, '.one~ .two', '.one~.two');
ava('combinator, adj sibling - space before', testLossy, '.one +.two', '.one+.two');
ava('combinator, adj sibling - space after', testLossy, '.one+ .two', '.one+.two');

ava('classes, extraneous spaces', testLossy, '  .h1   ,  .h2   ', '.h1,.h2');
ava('ids, extraneous spaces', testLossy, '  #h1   ,  #h2   ', '#h1,#h2');

ava('attribute, spaces in selector', testLossy, 'h1[  href  *=  "test"  ]', 'h1[href*="test"]');
ava('attribute, insensitive flag 1', testLossy, '[href="test" i  ]', '[href="test"i]');
ava('attribute, insensitive flag 2', testLossy, '[href=TEsT i  ]', '[href=TEsT i]');
ava('attribute, insensitive flag 3', testLossy, '[href=test i  ]', '[href=test i]');
ava('attribute, extreneous whitespace', testLossy, '  [href]   ,  [class]   ', '[href],[class]');

ava('namespace, space before', testLossy, '   postcss|button', 'postcss|button');
ava('namespace, space after', testLossy, 'postcss|button     ', 'postcss|button');
ava('namespace - all elements, space before', testLossy, '   postcss|*', 'postcss|*');
ava('namespace - all elements, space after', testLossy, 'postcss|*     ', 'postcss|*');
ava('namespace - all namespaces, space before', testLossy, '   *|button', '*|button');
ava('namespace - all namespaces, space after', testLossy, '*|button     ', '*|button');
ava('namespace - all elements in all namespaces, space before', testLossy, '   *|*', '*|*');
ava('namespace - all elements in all namespaces, space after', testLossy, '*|*     ', '*|*');
ava('namespace - all elements without namespace, space before', testLossy, '   |*', '|*');
ava('namespace - all elements without namespace, space after', testLossy, '|*     ', '|*');
ava('namespace - tag with no namespace, space before', testLossy, '   |button', '|button');
ava('namespace - tag with no namespace, space after', testLossy, '|button     ', '|button');
ava('namespace - inside attribute, space before', testLossy, ' [  postcss|href=test]', '[postcss|href=test]');
ava('namespace - inside attribute, space after', testLossy, '[postcss|href=  test  ] ', '[postcss|href=test]');
ava('namespace - inside attribute (2), space before', testLossy, ' [  postcss|href]', '[postcss|href]');
ava('namespace - inside attribute (2), space after', testLossy, '[postcss|href ] ', '[postcss|href]');
ava('namespace - inside attribute (3), space before', testLossy, ' [  *|href=test]', '[*|href=test]');
ava('namespace - inside attribute (3), space after', testLossy, '[*|href=  test  ] ', '[*|href=test]');
ava('namespace - inside attribute (4), space after', testLossy, '[|href=  test  ] ', '[|href=test]');

ava('tag - extraneous whitespace', testLossy, '  h1   ,  h2   ', 'h1,h2');
ava('tag - trailing comma', testLossy, 'h1, ', 'h1,');
ava('tag - trailing comma (1)', testLossy, 'h1,', 'h1,');
ava('tag - trailing comma (2)', testLossy, 'h1', 'h1');
ava('tag - trailing slash (1)', testLossy, 'h1\\    ', 'h1\\ ');
ava('tag - trailing slash (2)', testLossy, 'h1\\    h2\\', 'h1\\  h2\\');

ava('universal - combinator', testLossy, ' * + * ', '*+*');
ava('universal - extraneous whitespace', testLossy, '  *   ,  *   ', '*,*');
ava('universal - qualified universal selector', testLossy, '*[href] *:not(*.green)', '*[href] *:not(*.green)');

ava('nesting - spacing before', testLossy, '  &.class', '&.class');
ava('nesting - spacing after', testLossy, '&.class  ', '&.class');
ava('nesting - spacing between', testLossy, '&  .class  ', '& .class');

ava('pseudo (single) - spacing before', testLossy, '  :after', ':after');
ava('pseudo (single) - spacing after', testLossy, ':after  ', ':after');
ava('pseudo (double) - spacing before', testLossy, '  ::after', '::after');
ava('pseudo (double) - spacing after', testLossy, '::after  ', '::after');
ava('pseudo - multiple', testLossy, ' *:target::before ,   a:after  ', '*:target::before,a:after');
ava('pseudo - negated', testLossy, 'h1:not( .heading )', 'h1:not(.heading)');
ava('pseudo - negated with combinators (1)', testLossy, 'h1:not(.heading > .title)   >  h1', 'h1:not(.heading>.title)>h1');
ava('pseudo - negated with combinators (2)', testLossy, '.foo:nth-child(2n + 1)', '.foo:nth-child(2n+1)');
ava('pseudo - extra whitespace', testLossy, 'a:not(   h2   )', 'a:not(h2)');

ava('comments - comment inside descendant selector', testLossy, "div /* wtf */.foo", "div /* wtf */.foo");
ava('comments - comment inside complex selector', testLossy, "div /* wtf */ > .foo", "div/* wtf */>.foo");
ava('comments - comment inside compound selector with space', testLossy, "div    /* wtf */    .foo", "div /* wtf */.foo");
ava('@words - space before', testLossy, '  @media', '@media');
ava('@words - space after', testLossy, '@media  ', '@media');
ava('@words - maintains space between', testLossy, '@media (min-width: 700px) and (orientation: landscape)', '@media (min-width: 700px) and (orientation: landscape)');
ava('@words - extraneous space between', testLossy, '@media  (min-width:  700px)  and   (orientation:   landscape)', '@media (min-width: 700px) and (orientation: landscape)');
ava('@words - multiple', testLossy, '@media (min-width: 700px), (min-height: 400px)', '@media (min-width: 700px),(min-height: 400px)');
