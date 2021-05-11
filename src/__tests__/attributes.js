import process from "process";
import Attribute from '../selectors/attribute';
import {test, nodeVersionAtLeast, nodeVersionBefore} from './util/helpers';

process.throwDeprecation = true;

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

test('namespace with escapes', '[\\31 \\#\\32 |href]', (t, tree) => {
    let attr = tree.nodes[0].nodes[0];
    t.deepEqual(attr.namespace, '1#2');
    t.deepEqual(attr.raws.namespace, '\\31 \\#\\32 ');
    attr.namespace = "foo";
    t.deepEqual(attr.namespace, 'foo');
    t.deepEqual(attr.raws.namespace, undefined);
    attr.namespace = "1";
    t.deepEqual(attr.namespace, '1');
    t.deepEqual(attr.raws.namespace, '\\31');
});

test('attribute selector with a empty value', '[href=""]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '');
    t.true(tree.nodes[0].nodes[0].quoted);
});

test('attribute selector with a value', '[name=james]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'name');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'james');
    t.falsy(tree.nodes[0].nodes[0].quoted);
});

test('attribute selector with quoted value', '[name="james"]', (t, tree) => {
    let attr = tree.nodes[0].nodes[0];
    t.deepEqual(attr.attribute, 'name');
    t.deepEqual(attr.operator, '=');
    t.deepEqual(attr.value, 'james');
    t.deepEqual(attr.quoteMark, '"');
    t.truthy(attr.quoted);
    t.deepEqual(attr.getQuotedValue(), '"james"');
});

test('attribute selector with escaped quote', '[title="Something \\"weird\\""]', (t, tree) => {
    let attr = tree.nodes[0].nodes[0];
    t.deepEqual(attr.value, 'Something "weird"');
    t.deepEqual(attr.getQuotedValue(), '\"Something \\"weird\\"\"');
    t.deepEqual(attr.getQuotedValue({smart: true}), '\'Something "weird"\'');
    t.deepEqual(attr.getQuotedValue({quoteMark: null}), 'Something\\ \\"weird\\"');
    t.deepEqual(attr.quoteMark, '"');
    t.truthy(attr.quoted);
    t.deepEqual(attr.raws.value, '"Something \\"weird\\""');
    t.deepEqual(tree.toString(), '[title="Something \\"weird\\""]');
});

test('attribute selector with escaped colon', '[ng\\:cloak]', (t, tree) => {
    t.deepEqual(tree.toString(), '[ng\\:cloak]');
    let attr = tree.nodes[0].nodes[0];
    t.deepEqual(attr.raws.attribute, 'ng\\:cloak');
    t.deepEqual(attr.attribute, 'ng:cloak');
});

test('attribute selector with short hex escape', '[ng\\3a cloak]', (t, tree) => {
    t.deepEqual(tree.toString(), '[ng\\3a cloak]');
    let attr = tree.nodes[0].nodes[0];
    t.deepEqual(attr.raws.attribute, 'ng\\3a cloak');
    t.deepEqual(attr.attribute, 'ng:cloak');
});

test('attribute selector with hex escape', '[ng\\00003acloak]', (t, tree) => {
    t.deepEqual(tree.toString(), '[ng\\00003acloak]');
    let attr = tree.nodes[0].nodes[0];
    t.deepEqual(attr.raws.attribute, 'ng\\00003acloak');
    t.deepEqual(attr.attribute, 'ng:cloak');
});

test('assign attribute name requiring escape', '[ng\\:cloak]', (t, tree) => {
    let attr = tree.nodes[0].nodes[0];
    attr.attribute = "ng:foo";
    t.deepEqual(attr.raws.attribute, 'ng\\:foo');
    t.deepEqual(attr.attribute, 'ng:foo');
    t.deepEqual(tree.toString(), '[ng\\:foo]');
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
    t.deepEqual(tree.nodes[0].nodes[0].value, 'james');
    t.deepEqual(tree.nodes[0].nodes[0].quoteMark, '"');
    t.deepEqual(tree.nodes[0].nodes[1].value, '>');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'h1');
});

test('multiple quoted attribute selectors', '[href*="test.com"][rel=\'external\'][id][class~="test"] > [name]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'test.com');
    t.is(tree.nodes[0].nodes[0].quoteMark, '"');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'rel');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'external');
    t.is(tree.nodes[0].nodes[1].quoteMark, "'");
    t.deepEqual(tree.nodes[0].nodes[2].attribute, 'id');
    t.falsy(tree.nodes[0].nodes[2].value, 'should not have a value');
    t.is(tree.nodes[0].nodes[2].quoteMark, undefined, 'should not have a quoteMark set');
    t.deepEqual(tree.nodes[0].nodes[3].attribute, 'class');
    t.deepEqual(tree.nodes[0].nodes[3].value, 'test');
    t.deepEqual(tree.nodes[0].nodes[3].quoteMark, '"');
    t.deepEqual(tree.nodes[0].nodes[4].value, '>');
    t.deepEqual(tree.nodes[0].nodes[5].attribute, 'name');
    t.falsy(tree.nodes[0].nodes[5].value, 'should not have a value');
    t.is(tree.nodes[0].nodes[5].quoteMark, undefined, 'should not have a quoteMark set');
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
    t.deepEqual(tree.nodes[0].nodes[0].value, 'Something=weird');
    t.is(tree.nodes[0].nodes[0].quoteMark, '"');
    t.deepEqual(tree.nodes[0].nodes[0].getQuotedValue(), '"Something=weird"');
});

let selector = '[data-weird-attr*="Something=weird"],' +
               '[data-weird-attr^="Something=weird"],' +
               '[data-weird-attr$="Something=weird"],' +
               '[data-weird-attr|="Something=weird"]';
test('more attribute selector with quoted value containing "="', selector, (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'Something=weird');
    t.deepEqual(tree.nodes[1].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[1].nodes[0].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'Something=weird');
    t.deepEqual(tree.nodes[2].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[2].nodes[0].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[0].value, 'Something=weird');
    t.deepEqual(tree.nodes[3].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[3].nodes[0].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[0].value, 'Something=weird');
});

test('attribute selector with quoted value containing multiple "="', '[data-weird-attr="Something=weird SomethingElse=weirder"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'Something=weird SomethingElse=weirder');
});

selector = '[data-weird-attr*="Something=weird SomethingElse=weirder"],' +
           '[data-weird-attr^="Something=weird SomethingElse=weirder"],' +
           '[data-weird-attr$="Something=weird SomethingElse=weirder"],' +
           '[data-weird-attr|="Something=weird SomethingElse=weirder"]';
test('more attribute selector with quoted value containing multiple "="', selector, (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'Something=weird SomethingElse=weirder');
    t.deepEqual(tree.nodes[1].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[1].nodes[0].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'Something=weird SomethingElse=weirder');
    t.deepEqual(tree.nodes[2].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[2].nodes[0].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[0].value, 'Something=weird SomethingElse=weirder');
    t.deepEqual(tree.nodes[3].nodes[0].attribute, 'data-weird-attr');
    t.deepEqual(tree.nodes[3].nodes[0].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[0].value, 'Something=weird SomethingElse=weirder');
});

test('multiple attribute selectors with quoted value containing "="', '[data-weird-foo="foo=weird"][data-weird-bar="bar=weird"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo=weird');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'bar=weird');
});

test('multiple attribute selectors with value containing escaped "="', '[data-weird-foo=foo\\=weird][data-weird-bar=bar\\3d weird]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo=weird');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'bar=weird');
});

selector = '[data-weird-foo*="foo2=weirder"][data-weird-bar*="bar2=weirder"],' +
           '[data-weird-foo^="foo2=weirder"][data-weird-bar^="bar2=weirder"],' +
           '[data-weird-foo$="foo2=weirder"][data-weird-bar$="bar2=weirder"],' +
           '[data-weird-foo|="foo2=weirder"][data-weird-bar|="bar2=weirder"]';
test('more multiple attribute selectors with quoted value containing "="', selector, (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo2=weirder');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'bar2=weirder');
    t.deepEqual(tree.nodes[1].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[1].nodes[0].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'foo2=weirder');
    t.deepEqual(tree.nodes[1].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[1].nodes[1].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[1].value, 'bar2=weirder');
    t.deepEqual(tree.nodes[2].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[2].nodes[0].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[0].value, 'foo2=weirder');
    t.deepEqual(tree.nodes[2].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[2].nodes[1].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[1].value, 'bar2=weirder');
    t.deepEqual(tree.nodes[3].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[3].nodes[0].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[0].value, 'foo2=weirder');
    t.deepEqual(tree.nodes[3].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[3].nodes[1].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[1].value, 'bar2=weirder');
});

test('multiple attribute selectors with quoted value containing multiple "="', '[data-weird-foo="foo1=weirder foo2=weirder"][data-weird-bar="bar1=weirder bar2=weirder"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo1=weirder foo2=weirder');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'bar1=weirder bar2=weirder');
});

selector = '[data-weird-foo*="foo1=weirder foo2=weirder"][data-weird-bar*="bar1=weirder bar2=weirder"],' +
           '[data-weird-foo^="foo1=weirder foo2=weirder"][data-weird-bar^="bar1=weirder bar2=weirder"],' +
           '[data-weird-foo$="foo1=weirder foo2=weirder"][data-weird-bar$="bar1=weirder bar2=weirder"],' +
           '[data-weird-foo|="foo1=weirder foo2=weirder"][data-weird-bar|="bar1=weirder bar2=weirder"]';
test('more multiple attribute selectors with quoted value containing multiple "="', selector, (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo1=weirder foo2=weirder');
    t.deepEqual(tree.nodes[0].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[0].nodes[1].operator, '*=');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'bar1=weirder bar2=weirder');
    t.deepEqual(tree.nodes[1].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[1].nodes[0].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'foo1=weirder foo2=weirder');
    t.deepEqual(tree.nodes[1].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[1].nodes[1].operator, '^=');
    t.deepEqual(tree.nodes[1].nodes[1].value, 'bar1=weirder bar2=weirder');
    t.deepEqual(tree.nodes[2].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[2].nodes[0].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[0].value, 'foo1=weirder foo2=weirder');
    t.deepEqual(tree.nodes[2].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[2].nodes[1].operator, '$=');
    t.deepEqual(tree.nodes[2].nodes[1].value, 'bar1=weirder bar2=weirder');
    t.deepEqual(tree.nodes[3].nodes[0].attribute, 'data-weird-foo');
    t.deepEqual(tree.nodes[3].nodes[0].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[0].value, 'foo1=weirder foo2=weirder');
    t.deepEqual(tree.nodes[3].nodes[1].attribute, 'data-weird-bar');
    t.deepEqual(tree.nodes[3].nodes[1].operator, '|=');
    t.deepEqual(tree.nodes[3].nodes[1].value, 'bar1=weirder bar2=weirder');
});

test('spaces in attribute selectors', 'h1[  href  *=  "test"  ]', (t, tree) => {
    let attr = tree.nodes[0].nodes[1];
    t.deepEqual(attr.attribute, 'href');
    t.deepEqual(attr.spaces.attribute.before, '  ');
    t.deepEqual(attr.spaces.attribute.after, '  ');
    t.deepEqual(attr.operator, '*=');
    t.deepEqual(attr.spaces.operator.after, '  ');
    t.deepEqual(attr.value, 'test');
    t.deepEqual(attr.spaces.value.after, '  ');
    t.truthy(tree.nodes[0].nodes[1].quoted);
});

test('insensitive attribute selector 1', '[href="test" i]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'test');
    t.deepEqual(tree.nodes[0].nodes[0].insensitive, true);
    t.deepEqual(tree.nodes[0].nodes[0].insensitive, true);
});

test('insensitive attribute selector with a empty value', '[href="" i]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'href');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, '');
    t.deepEqual(tree.nodes[0].nodes[0].insensitive, true);
    t.true(tree.nodes[0].nodes[0].quoted);
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
test('capitalized insensitive attribute selector 3', '[href=test I]', (t, tree) => {
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

test('newline in attribute selector', '[class="woop \\\nwoop woop"]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].attribute, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].operator, '=');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'woop \nwoop woop');
    t.true(tree.nodes[0].nodes[0].quoted);
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
    t.deepEqual(attr.attribute, 'href');
    t.deepEqual(attr.value, 'test');
    t.deepEqual(attr.getQuotedValue(), 'test');
    t.deepEqual(attr.raws.value, 'te/*inside-value*/st');
    t.deepEqual(attr.raws.spaces.value.after, '/* wow */ /*omg*/');
    t.truthy(attr.insensitive);
    t.deepEqual(attr.offsetOf("attribute"), 13);
    t.deepEqual(attr.offsetOf("operator"), 35);
    t.deepEqual(attr.offsetOf("insensitive"), 95);
    t.deepEqual(attr.raws.spaces.insensitive.after, '/*bbq*/ /*whodoesthis*/');
    attr.value = "foo";
    t.is(attr.raws.value, undefined);
});

test('non standard modifiers', '[href="foo" y]', (t, tree) => {
    let attr = tree.atPosition(1, 13);
    t.deepEqual(attr.insensitive, false);
    t.deepEqual(attr.insensitiveFlag, '');
    t.deepEqual(attr.raws.insensitiveFlag, 'y');
    t.deepEqual(tree.toString(), '[href="foo" y]');
});

test('comment after insensitive(non space)', '[href="foo" i/**/]', (t, tree) => {
    // https://github.com/postcss/postcss-selector-parser/issues/150
    let attr = tree.atPosition(1, 13);
    t.deepEqual(attr.insensitive, true);
    t.deepEqual(attr.insensitiveFlag, 'i');
    t.is(attr.raws.insensitiveFlag, undefined);
    t.deepEqual(attr.raws.spaces.insensitive.after, '/**/');
    t.deepEqual(tree.toString(), '[href="foo" i/**/]');
});

test('comment after insensitive(space after)', '[href="foo" i/**/ ]', (t, tree) => {
    let attr = tree.atPosition(1, 13);
    t.deepEqual(attr.insensitive, true);
    t.deepEqual(attr.insensitiveFlag, 'i');
    t.deepEqual(attr.raws.spaces.insensitive.after, '/**/ ');
    t.deepEqual(tree.toString(), '[href="foo" i/**/ ]');
});

test('comment after insensitive(space before)', '[href="foo" i /**/]', (t, tree) => {
    let attr = tree.atPosition(1, 13);
    t.deepEqual(attr.insensitive, true);
    t.deepEqual(attr.insensitiveFlag, 'i');
    t.deepEqual(attr.raws.spaces.insensitive.after, ' /**/');
    t.deepEqual(tree.toString(), '[href="foo" i /**/]');
});

const testDeprecation = nodeVersionAtLeast('7.0.0') || nodeVersionBefore('6.0.0') ? test : test.skip;

testDeprecation('deprecated constructor', '', (t) => {
    t.throws(
        () => {
            return new Attribute({value: '"foo"', attribute: "data-bar"});
        },
        {message: "Constructing an Attribute selector with a value without specifying quoteMark is deprecated. Note: The value should be unescaped now."}
    );
});

testDeprecation('deprecated get of raws.unquoted ', '', (t) => {
    t.throws(
        () => {
            let attr = new Attribute({value: 'foo', quoteMark: '"', attribute: "data-bar"});
            return attr.raws.unquoted;
        },
        {message: "attr.raws.unquoted is deprecated. Call attr.value instead."}
    );
});

testDeprecation('deprecated set of raws.unquoted ', '', (t) => {
    t.throws(
        () => {
            let attr = new Attribute({value: 'foo', quoteMark: '"', attribute: "data-bar"});
            attr.raws.unquoted = 'fooooo';
        },
        {message: "Setting attr.raws.unquoted is deprecated and has no effect. attr.value is unescaped by default now."}
    );
});

testDeprecation('smart quotes', '[data-foo=bar]', (t, tree) => {
    let attr = tree.nodes[0].nodes[0];
    attr.setValue('changed', {quoteMark: '"'});
    t.deepEqual(attr.toString(), '[data-foo="changed"]');
    attr.setValue('changed again', {quoteMark: "'", preferCurrentQuoteMark: true});
    t.deepEqual(attr.toString(), '[data-foo="changed again"]');
    attr.setValue('smart-ident', {smart: true});
    t.deepEqual(attr.toString(), '[data-foo=smart-ident]');
    attr.setValue('smart quoted', {smart: true});
    t.deepEqual(attr.toString(), '[data-foo=smart\\ quoted]');
    attr.setValue('smart quoted three spaces', {smart: true});
    t.deepEqual(attr.toString(), '[data-foo="smart quoted three spaces"]');
    attr.setValue('smart quoted three spaces', {smart: true, quoteMark: "'"});
    t.deepEqual(attr.toString(), "[data-foo='smart quoted three spaces']");
    attr.setValue("smart with 'single quotes'", {smart: true});
    t.deepEqual(attr.toString(), "[data-foo=\"smart with 'single quotes'\"]");
    attr.setValue('smart with "double quotes"', {smart: true});
    t.deepEqual(attr.toString(), "[data-foo='smart with \"double quotes\"']");
});

testDeprecation('set Attribute#quoteMark', '[data-foo=bar]', (t, tree) => {
    let attr = tree.nodes[0].nodes[0];
    attr.quoteMark = '"';
    t.deepEqual(attr.toString(), '[data-foo="bar"]');
    attr.quoteMark = "'";
    t.deepEqual(attr.toString(), "[data-foo='bar']");
    attr.quoteMark = null;
    t.deepEqual(attr.toString(), "[data-foo=bar]");
    attr.value = "has space";
    t.deepEqual(attr.toString(), "[data-foo=has\\ space]");
    attr.quoteMark = '"';
    t.deepEqual(attr.toString(), '[data-foo="has space"]');
});
