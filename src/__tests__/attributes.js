import {test} from './util/helpers';

test('attribute selector', '[href]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'attribute');
    t.falsy(tree.nodes[0].nodes[0].quoted);
});

test('attribute selector spaces (before)', '[  href]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.attribute.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'attribute');
    t.falsy(tree.nodes[0].nodes[0].quoted);
});

test('attribute selector spaces (after)', '[href  ]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.attribute.after, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'attribute');
    t.falsy(tree.nodes[0].nodes[0].quoted);
});

test('attribute selector spaces with namespace (both)', '[  foo|bar   ]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].ns, 'foo');
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'bar');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.attribute.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.attribute.after, '   ');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'attribute');
    t.falsy(tree.nodes[0].nodes[0].quoted);
});
test('attribute selector spaces (both)', '[  href   ]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.attribute.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.attribute.after, '   ');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'attribute');
    t.falsy(tree.nodes[0].nodes[0].quoted);
});

test('multiple attribute selectors', '[href][class][name]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'class');
    t.deepEqual(tree.nodes[0].nodes[2].attribute, 'name');
});

test('select elements with or without a namespace', '[*|href]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].namespace, '*');
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
});

test('attribute selector with a value', '[name=james]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'name');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'james');
    t.falsy(tree.nodes[0].nodes[0].quoted);
    t.deepEqual(tree.nodes[0].nodes[0].raws.unquoted, 'james');
});

test('attribute selector with quoted value', '[name="james"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'name');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"james"');
    t.truthy(tree.nodes[0].nodes[0].quoted);
    t.deepEqual(tree.nodes[0].nodes[0].raws.unquoted, 'james');
});

test('attribute selector with escaped quote', '[title="Something \\"weird\\""]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '"Something \\"weird\\""');
    t.truthy(tree.nodes[0].nodes[0].quoted);
    t.deepEqual(tree.nodes[0].nodes[0].raws.unquoted, 'Something \\"weird\\"');
});

test('multiple attribute selectors + combinator', '[href][class][name] h1 > h2', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[2].attribute, 'name');
    t.deepEqual(tree.nodes[0].nodes[3].value, ' ');
    t.deepEqual(tree.nodes[0].nodes[5].value, '>');
    t.deepEqual(tree.nodes[0].nodes[6].value, 'h2');
});

test('attribute, class, combinator', '[href] > h2.test', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[1].value, '>');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h2');
    t.deepEqual(tree.nodes[0].nodes[3].value, 'test');
});

test('attribute selector with quoted value & combinator', '[name="james"] > h1', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '"james"');
    t.deepEqual(tree.nodes[0].nodes[1].value, '>');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h1');
});

test('multiple quoted attribute selectors', '[href*="test.com"][rel="external"][id][class~="test"] > [name]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"test.com"');
    t.truthy(tree.nodes[0].nodes[0].quoted);
    t.deepEqual(tree.nodes[0].nodes[0].raws.unquoted, 'test.com');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'rel');
    t.deepEqual(tree.nodes[0].nodes[1].value, '"external"');
    t.truthy(tree.nodes[0].nodes[1].quoted);
    t.deepEqual(tree.nodes[0].nodes[1].raws.unquoted, 'external');
    t.deepEqual(tree.nodes[0].nodes[2].attribute, 'id');
    t.falsy(tree.nodes[0].nodes[2].value, 'should not have a value');
    t.falsy(tree.nodes[0].nodes[2].quoted);
    t.deepEqual(tree.nodes[0].nodes[3].attribute, 'class');
    t.deepEqual(tree.nodes[0].nodes[3].value, '"test"');
    t.truthy(tree.nodes[0].nodes[3].quoted);
    t.deepEqual(tree.nodes[0].nodes[3].raws.unquoted, 'test');
    t.deepEqual(tree.nodes[0].nodes[4].value, '>');
    t.deepEqual(tree.nodes[0].nodes[5].attribute, 'name');
    t.falsy(tree.nodes[0].nodes[5].value, 'should not have a value');
});

test('more attribute operators', '[href*=test],[href^=test],[href$=test],[href|=test]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].operator, '*=');
    t.deepEqual(tree.nodes[1].nodes[0].operator, '^=');
    t.deepEqual(tree.nodes[2].nodes[0].operator, '$=');
    t.deepEqual(tree.nodes[3].nodes[0].operator, '|=');
});

test('attribute selector with quoted value containing "="', '[data-weird-attr="Something=weird"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"Something=weird"');
    t.truthy(tree.nodes[0].nodes[0].quoted);
    t.deepEqual(tree.nodes[0].nodes[0].raws.unquoted, 'Something=weird');
});

let selector = '[data-weird-attr*="Something=weird"],' +
               '[data-weird-attr^="Something=weird"],' +
               '[data-weird-attr$="Something=weird"],' +
               '[data-weird-attr|="Something=weird"]';
test('more attribute selector with quoted value containing "="', selector, (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"Something=weird"');
    t.deepEqual(tree.nodes[1].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[1].nodes[0].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[0].value, '"Something=weird"');
    t.deepEqual(tree.nodes[2].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[2].nodes[0].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[0].value, '"Something=weird"');
    t.deepEqual(tree.nodes[3].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[3].nodes[0].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[0].value, '"Something=weird"');
});

test('attribute selector with quoted value containing multiple "="', '[data-weird-attr="Something=weird SomethingElse=weirder"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"Something=weird SomethingElse=weirder"');
});

selector = '[data-weird-attr*="Something=weird SomethingElse=weirder"],' +
           '[data-weird-attr^="Something=weird SomethingElse=weirder"],' +
           '[data-weird-attr$="Something=weird SomethingElse=weirder"],' +
           '[data-weird-attr|="Something=weird SomethingElse=weirder"]';
test('more attribute selector with quoted value containing multiple "="', selector, (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"Something=weird SomethingElse=weirder"');
    t.deepEqual(tree.nodes[1].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[1].nodes[0].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[0].value, '"Something=weird SomethingElse=weirder"');
    t.deepEqual(tree.nodes[2].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[2].nodes[0].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[0].value, '"Something=weird SomethingElse=weirder"');
    t.deepEqual(tree.nodes[3].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[3].nodes[0].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[0].value, '"Something=weird SomethingElse=weirder"');
});

test('multiple attribute selectors with quoted value containing "="', '[data-weird-foo="foo=weird"][data-weird-bar="bar=weird"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"foo=weird"');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[1].value, '"bar=weird"');
});

selector = '[data-weird-foo*="foo2=weirder"][data-weird-bar*="bar2=weirder"],' +
           '[data-weird-foo^="foo2=weirder"][data-weird-bar^="bar2=weirder"],' +
           '[data-weird-foo$="foo2=weirder"][data-weird-bar$="bar2=weirder"],' +
           '[data-weird-foo|="foo2=weirder"][data-weird-bar|="bar2=weirder"]';
test('more multiple attribute selectors with quoted value containing "="', selector, (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"foo2=weirder"');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[1].value, '"bar2=weirder"');
    t.deepEqual(tree.nodes[1].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[1].nodes[0].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[0].value, '"foo2=weirder"');
    t.deepEqual(tree.nodes[1].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[1].nodes[1].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[1].value, '"bar2=weirder"');
    t.deepEqual(tree.nodes[2].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[2].nodes[0].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[0].value, '"foo2=weirder"');
    t.deepEqual(tree.nodes[2].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[2].nodes[1].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[1].value, '"bar2=weirder"');
    t.deepEqual(tree.nodes[3].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[3].nodes[0].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[0].value, '"foo2=weirder"');
    t.deepEqual(tree.nodes[3].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[3].nodes[1].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[1].value, '"bar2=weirder"');
});

test('multiple attribute selectors with quoted value containing multiple "="', '[data-weird-foo="foo1=weirder foo2=weirder"][data-weird-bar="bar1=weirder bar2=weirder"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"foo1=weirder foo2=weirder"');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[1].value, '"bar1=weirder bar2=weirder"');
});

selector = '[data-weird-foo*="foo1=weirder foo2=weirder"][data-weird-bar*="bar1=weirder bar2=weirder"],' +
           '[data-weird-foo^="foo1=weirder foo2=weirder"][data-weird-bar^="bar1=weirder bar2=weirder"],' +
           '[data-weird-foo$="foo1=weirder foo2=weirder"][data-weird-bar$="bar1=weirder bar2=weirder"],' +
           '[data-weird-foo|="foo1=weirder foo2=weirder"][data-weird-bar|="bar1=weirder bar2=weirder"]';
test('more multiple attribute selectors with quoted value containing multiple "="', selector, (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '"foo1=weirder foo2=weirder"');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[1].value, '"bar1=weirder bar2=weirder"');
    t.deepEqual(tree.nodes[1].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[1].nodes[0].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[0].value, '"foo1=weirder foo2=weirder"');
    t.deepEqual(tree.nodes[1].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[1].nodes[1].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[1].value, '"bar1=weirder bar2=weirder"');
    t.deepEqual(tree.nodes[2].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[2].nodes[0].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[0].value, '"foo1=weirder foo2=weirder"');
    t.deepEqual(tree.nodes[2].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[2].nodes[1].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[1].value, '"bar1=weirder bar2=weirder"');
    t.deepEqual(tree.nodes[3].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[3].nodes[0].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[0].value, '"foo1=weirder foo2=weirder"');
    t.deepEqual(tree.nodes[3].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[3].nodes[1].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[1].value, '"bar1=weirder bar2=weirder"');
});

test('spaces in attribute selectors', 'h1[  href  *=  "test"  ]', (t, tree) => {
    let attr = tree.nodes[0].nodes[1];
    t.deepEqual(attr.attribute, 'href');
    t.deepEqual(attr.spaces.attribute.before, '  ');
    t.deepEqual(attr.spaces.attribute.after, '  ');
    t.deepEqual(attr.operator, '*=');
    t.deepEqual(attr.spaces.operator.after, '  ');
    t.deepEqual(attr.value, '"test"');
    t.deepEqual(attr.spaces.value.after, '  ');
    t.truthy(tree.nodes[0].nodes[1].quoted);
    t.deepEqual(tree.nodes[0].nodes[1].raws.unquoted, 'test');
});

test('insensitive attribute selector 1', '[href="test" i]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '"test"');
    t.deepEqual(tree.nodes[0].nodes[0].insensitive, true);
    t.deepEqual(tree.nodes[0].nodes[0].insensitive, true);
});

test('insensitive attribute selector 2', '[href=TEsT i  ]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'TEsT');
    t.deepEqual(tree.nodes[0].nodes[0].insensitive, true);
    t.deepEqual(tree.nodes[0].nodes[0].spaces.value.after, ' ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.insensitive.after, '  ');
});

test('insensitive attribute selector 3', '[href=test i]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'test');
    t.deepEqual(tree.nodes[0].nodes[0].insensitive, true);
});

test('extraneous non-combinating whitespace', '  [href]   ,  [class]   ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.deepEqual(tree.nodes[1].nodes[0].attribute, 'class');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.after, '   ');
});

test('comments within attribute selectors', '[href/* wow */=/* wow */test]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'test');
    t.deepEqual(tree.nodes[0].nodes[0].raws.attribute, 'href/* wow */');
    t.deepEqual(tree.nodes[0].nodes[0].raws.operator, '=/* wow */');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'test');
});

test('comments within attribute selectors (2)', '[/* wow */href=test/* wow */]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'test');
    t.deepEqual(tree.nodes[0].nodes[0].raws.spaces.attribute.before, '/* wow */');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'test/* wow */');
});

test('comments within attribute selectors (3)', '[href=test/* wow */i]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'testi');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'test/* wow */i');
    t.falsy(tree.nodes[0].nodes[0].insensitive);
});

test('comments within attribute selectors (4)', '[ /*before*/ href /* after-attr */ = /* after-operator */ te/*inside-value*/st/* wow */ /*omg*/i/*bbq*/ /*whodoesthis*/]', (t, tree) => {
    let attr = tree.nodes[0].nodes[0];
    console.log(attr.spaces);
    console.log(attr.raws);
    t.deepEqual(attr.attribute, 'href');
    t.deepEqual(attr.value, 'test');
    t.deepEqual(attr.raws.unquoted, 'test');
    t.deepEqual(attr.raws.spaces.value.after, '/* wow */ /*omg*/');
    t.truthy(attr.insensitive);
    t.deepEqual(attr.offsetOf("attribute"), 13);
    t.deepEqual(attr.offsetOf("operator"), 35);
    t.deepEqual(attr.offsetOf("insensitive"), 95);
    t.deepEqual(attr.raws.spaces.insensitive.after, '/*bbq*/ /*whodoesthis*/');
});

// test('attributes with escapes', '[ng\\:cloak]', (t, tree) => {
//     t.deepEqual(tree.toString(), '[ng\\:cloak]');
// });
