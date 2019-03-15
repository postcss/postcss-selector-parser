import {test} from './util/helpers';

test('id selector', '#one', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'one');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id selector with universal', '*#z98y ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '*');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'universal');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'z98y');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'id');
});

test('id hack', '#one#two', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'id');
});

test('id and class names mixed', '#one.two.three', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'one');
    t.deepEqual(tree.nodes[0].nodes[1].value, 'two');
    t.deepEqual(tree.nodes[0].nodes[2].value, 'three');

    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'class');
});

test('qualified id', 'button#one', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'id');
});

test('qualified id & class name', 'h1#one.two', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].type, 'tag');
    t.deepEqual(tree.nodes[0].nodes[1].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[2].type, 'class');
});

test('extraneous non-combinating whitespace', '  #h1   ,  #h2   ', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'h1');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[0].nodes[0].spaces.after, '   ');
    t.deepEqual(tree.nodes[1].nodes[0].value, 'h2');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.before, '  ');
    t.deepEqual(tree.nodes[1].nodes[0].spaces.after, '   ');
});

test('Sass interpolation within a class', '.#{foo}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes.length, 1);
    t.deepEqual(tree.nodes[0].nodes[0].type, 'class');
    t.deepEqual(tree.nodes[0].nodes[0].value, '#{foo}');
});

test('Sass interpolation within an id', '#foo#{bar}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes.length, 1);
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo#{bar}');
});

test('Less interpolation within an id', '#foo@{bar}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes.length, 1);
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo@{bar}');
});

test('id selector with escaping', '#\\#test', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '#test');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\#test');
});

test('id selector with escaping (2)', '#-a-b-c-', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '-a-b-c-');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id selector with escaping (3)', '#u-m\\00002b', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'u-m+');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'u-m\\00002b');
});

test('id selector with escaping (4)', '#♥', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '♥');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id selector with escaping (5)', '#©', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '©');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id selector with escaping (6)', '#“‘’”', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '“‘’”');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id selector with escaping (7)', '#☺☃', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '☺☃');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id selector with escaping (8)', '#⌘⌥', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '⌘⌥');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id selector with escaping (9)', '#𝄞♪♩♫♬', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '𝄞♪♩♫♬');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id selector with escaping (10)', '#💩', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '💩');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
});

test('id selector with escaping (11)', '#\\?', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '?');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\?');
});

test('id selector with escaping (12)', '#\\@', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '@');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\@');
});

test('id selector with escaping (13)', '#\\.', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '.');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\.');
});

test('id selector with escaping (14)', '#\\3A \\)', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ':)');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\3A \\)');
});

test('id selector with escaping (15)', '#\\3A \\`\\(', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ':`(');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\3A \\`\\(');
});

test('id selector with escaping (16)', '#\\31 23', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '123');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\31 23');
});

test('id selector with escaping (17)', '#\\31 a2b3c', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '1a2b3c');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\31 a2b3c');
});

test('id selector with escaping (18)', '#\\<p\\>', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '<p>');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\<p\\>');
});

test('id selector with escaping (19)', '#\\<\\>\\<\\<\\<\\>\\>\\<\\>', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '<><<<>><>');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\<\\>\\<\\<\\<\\>\\>\\<\\>');
});

test('id selector with escaping (20)', '#\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\[\\>\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\>\\+\\<\\<\\<\\<\\-\\]\\>\\+\\+\\.\\>\\+\\.\\+\\+\\+\\+\\+\\+\\+\\.\\.\\+\\+\\+\\.\\>\\+\\+\\.\\<\\<\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\.\\>\\.\\+\\+\\+\\.\\-\\-\\-\\-\\-\\-\\.\\-\\-\\-\\-\\-\\-\\-\\-\\.\\>\\+\\.\\>\\.', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\[\\>\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\>\\+\\+\\+\\>\\+\\<\\<\\<\\<\\-\\]\\>\\+\\+\\.\\>\\+\\.\\+\\+\\+\\+\\+\\+\\+\\.\\.\\+\\+\\+\\.\\>\\+\\+\\.\\<\\<\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\+\\.\\>\\.\\+\\+\\+\\.\\-\\-\\-\\-\\-\\-\\.\\-\\-\\-\\-\\-\\-\\-\\-\\.\\>\\+\\.\\>\\.');
});

test('id selector with escaping (21)', '#\\#', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '#');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\#');
});

test('id selector with escaping (22)', '#\\#\\#', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '##');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\#\\#');
});

test('id selector with escaping (23)', '#\\#\\.\\#\\.\\#', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '#.#.#');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\#\\.\\#\\.\\#');
});

test('id selector with escaping (24)', '#\\_', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '_');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\_');
});

test('id selector with escaping (25)', '#\\{\\}', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '{}');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\{\\}');
});

test('id selector with escaping (26)', '#\\.fake\\-class', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '.fake-class');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\.fake\\-class');
});

test('id selector with escaping (27)', '#foo\\.bar', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'foo.bar');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'foo\\.bar');
});

test('id selector with escaping (28)', '#\\3A hover', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ':hover');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\3A hover');
});

test('id selector with escaping (29)', '#\\3A hover\\3A focus\\3A active', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, ':hover:focus:active');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\3A hover\\3A focus\\3A active');
});

test('id selector with escaping (30)', '#\\[attr\\=value\\]', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, '[attr=value]');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, '\\[attr\\=value\\]');
});

test('id selector with escaping (31)', '#f\\/o\\/o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f/o/o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\/o\\/o');
});

test('id selector with escaping (32)', '#f\\\\o\\\\o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f\\o\\o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\\\o\\\\o');
});

test('id selector with escaping (33)', '#f\\*o\\*o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f*o*o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\*o\\*o');
});

test('id selector with escaping (34)', '#f\\!o\\!o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f!o!o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\!o\\!o');
});

test('id selector with escaping (35)', '#f\\\'o\\\'o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f\'o\'o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\\'o\\\'o');
});

test('id selector with escaping (36)', '#f\\~o\\~o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f~o~o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\~o\\~o');
});

test('id selector with escaping (37)', '#f\\+o\\+o', (t, tree) => {
    t.deepEqual(tree.nodes[0].nodes[0].value, 'f+o+o');
    t.deepEqual(tree.nodes[0].nodes[0].type, 'id');
    t.deepEqual(tree.nodes[0].nodes[0].raws.value, 'f\\+o\\+o');
});
