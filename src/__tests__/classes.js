import {test} from './util/helpers';

test('class name', '.one', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'one');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('multiple class names', '.one.two.three', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'one');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'two');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'three');
});

test('qualified class', 'button.btn-primary', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'class');
});

test('escaped numbers in class name', '.\\31\\ 0', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].value, '1 0');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\31\\ 0');
});

test('extraneous non-combinating whitespace', '  .h1   ,  .h2   ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'h2');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.after, '   ');
});

test('Less interpolation within a class', '.foo@{bar}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes.length, 1);
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo@{bar}');
});

test('ClassName#set value', ".fo\\o", (t, selectors) => {
    let className = selectors.first.first;
    t.deepEqual(className.raws, {value: "fo\\o"});
    className.value = "bar";
    t.deepEqual(className.raws, {});
});

test('escaped dot in class name', '.foo\\.bar', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo.bar');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'foo\\.bar');
});

test('class selector with escaping', '.♥', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '♥');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('class selector with escaping (1)', '.©', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '©');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('class selector with escaping (2)', '.“‘’”', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '“‘’”');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('class selector with escaping (3)', '.☺☃', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '☺☃');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('class selector with escaping (4)', '.⌘⌥', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '⌘⌥');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('class selector with escaping (5)', '.𝄞♪♩♫♬', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '𝄞♪♩♫♬');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('class selector with escaping (6)', '.💩', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '💩');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
});

test('class selector with escaping (7)', '.\\?', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '?');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\?');
});

test('class selector with escaping (8)', '.\\@', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '@');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\@');
});

test('class selector with escaping (9)', '.\\.', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '.');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\.');
});

test('class selector with escaping (10)', '.\\3A \\)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ':)');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\3A \\)');
});

test('class selector with escaping (11)', '.\\3A \\`\\(', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ':`(');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\3A \\`\\(');
});

test('class selector with escaping (12)', '.\\31 23', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '123');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\31 23');
});

test('class selector with escaping (13)', '.\\31 a2b3c', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '1a2b3c');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\31 a2b3c');
});

test('class selector with escaping (14)', '.\\<p\\>', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '<p>');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\<p\\>');
});

test('class selector with escaping (15)', '.\\<\\>\\<\\<\\<\\>\\>\\<\\>', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '<><<<>><>');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\<\\>\\<\\<\\<\\>\\>\\<\\>');
});

test('class selector with escaping (16)', '.\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\[\\>\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\>\\+\\<\\<\\<\\<\\-\\]\\>\\+\\+\\.\\>\\+\\.\\+\\+\\+\\+\\+\\+\\+\\.\\.\\+\\+\\+\\.\\>\\+\\+\\.\\<\\<\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\.\\>\\.\\+\\+\\+\\.\\-\\-\\-\\-\\-\\-\\.\\-\\-\\-\\-\\-\\-\\-\\-\\.\\>\\+\\.\\>\\.', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\[\\>\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\>\\+\\<\\<\\<\\<\\-\\]\\>\\+\\+\\.\\>\\+\\.\\+\\+\\+\\+\\+\\+\\+\\.\\.\\+\\+\\+\\.\\>\\+\\+\\.\\<\\<\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\.\\>\\.\\+\\+\\+\\.\\-\\-\\-\\-\\-\\-\\.\\-\\-\\-\\-\\-\\-\\-\\-\\.\\>\\+\\.\\>\\.');
});

test('class selector with escaping (17)', '.\\#', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '#');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\#');
});

test('class selector with escaping (18)', '.\\#\\#', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '##');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\#\\#');
});

test('class selector with escaping (19)', '.\\#\\.\\#\\.\\#', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '#.#.#');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\#\\.\\#\\.\\#');
});

test('class selector with escaping (20)', '.\\_', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '_');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\_');
});

test('class selector with escaping (21)', '.\\{\\}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '{}');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\{\\}');
});

test('class selector with escaping (22)', '.\\#fake\\-id', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '#fake-id');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\#fake\\-id');
});

test('class selector with escaping (23)', '.foo\\.bar', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo.bar');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'foo\\.bar');
});

test('class selector with escaping (24)', '.\\3A hover', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ':hover');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\3A hover');
});

test('class selector with escaping (25)', '.\\3A hover\\3A focus\\3A active', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ':hover:focus:active');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\3A hover\\3A focus\\3A active');
});

test('class selector with escaping (26)', '.\\[attr\\=value\\]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '[attr=value]');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\[attr\\=value\\]');
});

test('class selector with escaping (27)', '.f\\/o\\/o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f/o/o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\/o\\/o');
});

test('class selector with escaping (28)', '.f\\\\o\\\\o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f\\o\\o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\\\o\\\\o');
});

test('class selector with escaping (29)', '.f\\*o\\*o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f*o*o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\*o\\*o');
});

test('class selector with escaping (30)', '.f\\!o\\!o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f!o!o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\!o\\!o');
});

test('class selector with escaping (31)', '.f\\\'o\\\'o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f\'o\'o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\\'o\\\'o');
});

test('class selector with escaping (32)', '.f\\~o\\~o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f~o~o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\~o\\~o');
});

test('class selector with escaping (33)', '.f\\+o\\+o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f+o+o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\+o\\+o');
});

test('class selector with escaping (34)', '.\\1D306', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '𝌆');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\1D306');
});

test('class selector with escaping (35)', '.not-pseudo\\:focus', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'not-pseudo:focus');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'not-pseudo\\:focus');
});

test('class selector with escaping (36)', '.not-pseudo\\:\\:focus', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'not-pseudo::focus');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'not-pseudo\\:\\:focus');
});

