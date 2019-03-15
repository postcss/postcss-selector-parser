import {test} from './util/helpers';

test('pseudo element (single colon)', 'h1:after', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].value, ':after');
});

test('pseudo element (double colon)', 'h1::after', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].value, '::after');
});

test('multiple pseudo elements', '*:target::before, a:after', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
    t.deepEqual(tree.nodes[0].nodes[1].value, ':target');
    t.deepEqual(tree.nodes[0].nodes[2].value, '::before');
    t.deepEqual(tree.nodes[1].nodes[1].value, ':after');
});

test('negation pseudo element', 'h1:not(.heading)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].value, ':not');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, 'heading');
});

test('negation pseudo element (2)', 'h1:not(.heading, .title, .content)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].value, ':not');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, 'heading');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[1].nodes[0].value, 'title');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[2].nodes[0].value, 'content');
});

test('negation pseudo element (3)', 'h1:not(.heading > .title) > h1', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, 'heading');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[1].value, '>');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[2].value, 'title');
    t.deepEqual(tree.nodes[0].nodes[2].value, '>');
    t.deepEqual(tree.nodes[0].nodes[3].value, 'h1');
});

test('negation pseudo element (4)', 'h1:not(h2:not(h3))', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[1].nodes[0].nodes[0].value, 'h3');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[1].nodes[0].nodes[0].parent.type, 'selector');
});

test('pseudo class in the middle of a selector', 'a:link.external', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'a');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].value, ':link');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'external');
});

test('extra whitespace inside parentheses', 'a:not(   h2   )', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, 'h2');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].spaces.after, '   ');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].spaces.before, '   ');
});

test('escaped numbers in class name with pseudo', 'a:before.\\31\\ 0', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[2].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[2].value, '1 0');
    t.deepEqual(tree.nodes[0].nodes[2].raws.value, '\\31\\ 0');
});

test('nested pseudo', '.btn-group>.btn:last-child:not(:first-child)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[4].value, ':not');
});

test('extraneous non-combinating whitespace', '  h1:after   ,  h2:after   ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[1].value, ':after');
    t.deepEqual(tree.nodes[0].nodes[1].spaces.after, '   ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[1].nodes[1].value, ':after');
    t.deepEqual(tree.nodes[1].nodes[1].spaces.after, '   ');
});

test('negation pseudo element with quotes', 'h1:not(".heading")', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].value, ':not');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, '".heading"');
});

test('negation pseudo element with single quotes', "h1:not('.heading')", (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].value, ':not');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, "'.heading'");
});

test('Issue #116', "svg:not(:root)", (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[1].value, ':not');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, ':root');
});

test('alone pseudo class', ':root', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[0].value, ':root');
});

test('non standard pseudo (@custom-selector)', ":--foobar, a", (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ':--foobar');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'pseudo');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'a');
    t.deepEqual(tree.nodes[1].nodes[0].type, 'tag');
});

test('non standard pseudo (@custom-selector) (1)', "a, :--foobar", (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'a');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[1].nodes[0].value, ':--foobar');
    t.deepEqual(tree.nodes[1].nodes[0].type, 'pseudo');
});

test('current pseudo class', ':current(p, li, dt, dd)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[0].value, ':current');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[0].nodes[0].value, 'p');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[1].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[1].nodes[0].value, 'li');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[2].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[2].nodes[0].value, 'dt');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[3].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[3].nodes[0].value, 'dd');
});

test('is pseudo class', ':is(p, li, dt, dd)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[0].value, ':is');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[0].nodes[0].value, 'p');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[1].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[1].nodes[0].value, 'li');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[2].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[2].nodes[0].value, 'dt');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[3].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].nodes[3].nodes[0].value, 'dd');
});

test('is pseudo class with namespace', '*|*:is(:hover, :focus) ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'universal');
    t.deepEqual(tree.nodes[0].nodes[0].namespace, '*');
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].value, ':is');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, ':hover');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[1].nodes[0].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[1].nodes[0].value, ':focus');
});

test('has pseudo class', 'a:has(> img)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'a');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].value, ':has');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].type, 'combinator');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, '>');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[1].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[1].value, 'img');
});

test('where pseudo class', 'a:where(:not(:hover))', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'a');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].value, ':where');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, ':not');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].nodes[0].nodes[0].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].nodes[0].nodes[0].value, ':hover');
});

test('nested pseudo classes', "section:not( :has(h1, h2 ) )", (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'section');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].value, ':not');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].type, 'pseudo');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].value, ':has');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].nodes[1].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].nodes[0].nodes[0].nodes[1].nodes[0].value, 'h2');
});
