import {test} from './util/helpers';

test('universal selector', '*', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 1);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
});

test('lobotomized owl selector', '* + *', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 1);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
    t.same(tree.nodes[0].nodes[1].source.start.column, 3);
    t.same(tree.nodes[0].nodes[1].source.end.column, 3);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 2);
    t.same(tree.nodes[0].nodes[2].source.start.column, 5);
    t.same(tree.nodes[0].nodes[2].source.end.column, 5);
    t.same(tree.nodes[0].nodes[2].sourceIndex, 4);
});

test('comment', '/**\n * Hello!\n */', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 3);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
});

test('comment & universal selectors', '*/*test*/*', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 1);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
    t.same(tree.nodes[0].nodes[1].source.start.column, 2);
    t.same(tree.nodes[0].nodes[1].source.end.column, 9);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 1);
    t.same(tree.nodes[0].nodes[2].source.start.column, 10);
    t.same(tree.nodes[0].nodes[2].source.end.column, 10);
    t.same(tree.nodes[0].nodes[2].sourceIndex, 9);
});

test('tag selector', 'h1', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 2);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
});

test('id selector', '#id', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 3);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
});

test('tag selector followed by id selector', 'h1, #id', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 2);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
    t.same(tree.nodes[1].nodes[0].source.start.column, 5);
    t.same(tree.nodes[1].nodes[0].source.end.column, 7);
    t.same(tree.nodes[1].nodes[0].sourceIndex, 4);
});

test('multiple id selectors', '#one#two', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 4);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
    t.same(tree.nodes[0].nodes[1].source.start.column, 5);
    t.same(tree.nodes[0].nodes[1].source.end.column, 8);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 4);
});

test('multiple id selectors (2)', '#one#two#three#four', (t, tree) => {
    t.same(tree.nodes[0].nodes[2].source.start.column, 9);
    t.same(tree.nodes[0].nodes[2].source.end.column, 14);
    t.same(tree.nodes[0].nodes[2].sourceIndex, 8);
    t.same(tree.nodes[0].nodes[3].source.start.column, 15);
    t.same(tree.nodes[0].nodes[3].source.end.column, 19);
    t.same(tree.nodes[0].nodes[3].sourceIndex, 14);
});

test('multiple id selectors (3)', '#one#two,#three#four', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].source.start.column, 5);
    t.same(tree.nodes[0].nodes[1].source.end.column, 8);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 4);
    t.same(tree.nodes[1].nodes[1].source.start.column, 16);
    t.same(tree.nodes[1].nodes[1].source.end.column, 20);
    t.same(tree.nodes[1].nodes[1].sourceIndex, 15);
});

test('multiple class selectors', '.one.two,.three.four', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].source.start.column, 5);
    t.same(tree.nodes[0].nodes[1].source.end.column, 8);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 4);
    t.same(tree.nodes[1].nodes[1].source.start.column, 16);
    t.same(tree.nodes[1].nodes[1].source.end.column, 20);
    t.same(tree.nodes[1].nodes[1].sourceIndex, 15);
});

test('attribute selector', '[name="james"]', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.line, 1);
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 14);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
});

test('multiple attribute selectors', '[name="james"][name="ed"],[name="snakeman"][name="a"]', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.line, 1);
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.line, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 14);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);
    t.same(tree.nodes[0].nodes[1].source.start.line, 1);
    t.same(tree.nodes[0].nodes[1].source.start.column, 15);
    t.same(tree.nodes[0].nodes[1].source.end.line, 1);
    t.same(tree.nodes[0].nodes[1].source.end.column, 25);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 14);
    t.same(tree.nodes[1].nodes[0].source.start.line, 1);
    t.same(tree.nodes[1].nodes[0].source.start.column, 27);
    t.same(tree.nodes[1].nodes[0].source.end.line, 1);
    t.same(tree.nodes[1].nodes[0].source.end.column, 43);
    t.same(tree.nodes[1].nodes[0].sourceIndex, 26);
    t.same(tree.nodes[1].nodes[1].source.start.line, 1);
    t.same(tree.nodes[1].nodes[1].source.start.column, 44);
    t.same(tree.nodes[1].nodes[1].source.end.line, 1);
    t.same(tree.nodes[1].nodes[1].source.end.column, 53);
    t.same(tree.nodes[1].nodes[1].sourceIndex, 43);
});

test('pseudo-class', 'h1:first-child', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].source.start.line, 1);
    t.same(tree.nodes[0].nodes[1].source.start.column, 3);
    t.same(tree.nodes[0].nodes[1].source.end.column, 14);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 2);
});

test('pseudo-class with argument', 'h1:not(.strudel, .food)', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].source.start.line, 1);
    t.same(tree.nodes[0].nodes[1].source.start.column, 3);
    t.same(tree.nodes[0].nodes[1].source.end.column, 23);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 2);
});

test('pseudo-element', 'h1::before', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].source.start.line, 1);
    t.same(tree.nodes[0].nodes[1].source.start.column, 3);
    t.same(tree.nodes[0].nodes[1].source.end.column, 10);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 2);
});

test('multiple pseudos', 'h1:not(.food)::before, a:first-child', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].source.start.line, 1);
    t.same(tree.nodes[0].nodes[1].source.start.column, 3);
    t.same(tree.nodes[0].nodes[1].source.end.column, 13);
    t.same(tree.nodes[0].nodes[1].sourceIndex, 2);
    t.same(tree.nodes[0].nodes[2].source.start.line, 1);
    t.same(tree.nodes[0].nodes[2].source.start.column, 14);
    t.same(tree.nodes[0].nodes[2].source.end.column, 21);
    t.same(tree.nodes[0].nodes[2].sourceIndex, 13);
    t.same(tree.nodes[1].nodes[1].source.start.line, 1);
    t.same(tree.nodes[1].nodes[1].source.start.column, 25);
    t.same(tree.nodes[1].nodes[1].source.end.column, 36);
    t.same(tree.nodes[1].nodes[1].sourceIndex, 24);
});

test('combinators', 'div > h1 span', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].source.start.line, 1, "> start line");
    t.same(tree.nodes[0].nodes[1].source.start.column, 5, "> start column");
    t.same(tree.nodes[0].nodes[1].source.end.column, 5, "> end column");
    t.same(tree.nodes[0].nodes[1].sourceIndex, 4, "> sourceIndex");

    t.same(tree.nodes[0].nodes[3].source.start.line, 1, "' ' start line");
    t.same(tree.nodes[0].nodes[3].source.start.column, 9, "' ' start column");
    t.same(tree.nodes[0].nodes[3].source.end.column, 9, "' ' end column");
    t.same(tree.nodes[0].nodes[3].sourceIndex, 8, "' ' sourceIndex");
});

test('combinators surrounded by superfluous spaces', 'div   >  h1 ~   span   a', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].source.start.line, 1, "> start line");
    t.same(tree.nodes[0].nodes[1].source.start.column, 7, "> start column");
    t.same(tree.nodes[0].nodes[1].source.end.column, 7, "> end column");
    t.same(tree.nodes[0].nodes[1].sourceIndex, 6, "> sourceIndex");

    t.same(tree.nodes[0].nodes[3].source.start.line, 1, "~ start line");
    t.same(tree.nodes[0].nodes[3].source.start.column, 13, "~ start column");
    t.same(tree.nodes[0].nodes[3].source.end.column, 13, "~ end column");
    t.same(tree.nodes[0].nodes[3].sourceIndex, 12, "~ sourceIndex");

    t.same(tree.nodes[0].nodes[5].source.start.line, 1, "' ' start line");
    t.same(tree.nodes[0].nodes[5].source.start.column, 21, "' ' start column");
    t.same(tree.nodes[0].nodes[5].source.end.column, 21, "' ' end column");
    t.same(tree.nodes[0].nodes[5].sourceIndex, 20, "' ' sourceIndex");
});

test('multiple id selectors on different lines', '#one,\n#two', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.line, 1);
    t.same(tree.nodes[0].nodes[0].source.start.column, 1);
    t.same(tree.nodes[0].nodes[0].source.end.column, 4);
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0);

    t.same(tree.nodes[1].nodes[0].source.start.line, 2);
    t.same(tree.nodes[1].nodes[0].source.start.column, 1);
    t.same(tree.nodes[1].nodes[0].source.end.column, 4);
    t.same(tree.nodes[1].nodes[0].sourceIndex, 6);
});

test('multiple id selectors on different CRLF lines', '#one,\r\n#two,\r\n#three', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.line, 1, '#one start line');
    t.same(tree.nodes[0].nodes[0].source.start.column, 1, '#one start column');
    t.same(tree.nodes[0].nodes[0].source.end.column, 4, '#one end column');
    t.same(tree.nodes[0].nodes[0].sourceIndex, 0, '#one sourceIndex');

    t.same(tree.nodes[1].nodes[0].source.start.line, 2, '#two start line');
    t.same(tree.nodes[1].nodes[0].source.start.column, 1, '#two start column');
    t.same(tree.nodes[1].nodes[0].source.end.column, 4, '#two end column');
    t.same(tree.nodes[1].nodes[0].sourceIndex, 7, '#two sourceIndex');

    t.same(tree.nodes[2].nodes[0].source.start.line, 3, '#three start line');
    t.same(tree.nodes[2].nodes[0].source.start.column, 1, '#three start column');
    t.same(tree.nodes[2].nodes[0].source.end.column, 6, '#three end column');
    t.same(tree.nodes[2].nodes[0].sourceIndex, 14, '#three sourceIndex');
});

test('id, tag, pseudo, and class selectors on different lines with indentation', '\t#one,\n\th1:after,\n\t\t.two', (t, tree) => {
    t.same(tree.nodes[0].nodes[0].source.start.line, 1, '#one start line');
    t.same(tree.nodes[0].nodes[0].source.start.column, 2, '#one start column');
    t.same(tree.nodes[0].nodes[0].source.end.column, 5, '#one end column');
    t.same(tree.nodes[0].nodes[0].sourceIndex, 1, '#one sourceIndex');

    t.same(tree.nodes[1].nodes[0].source.start.line, 2, 'h1 start line');
    t.same(tree.nodes[1].nodes[0].source.start.column, 2, 'h1 start column');
    t.same(tree.nodes[1].nodes[0].source.end.column, 3, 'h1 end column');
    t.same(tree.nodes[1].nodes[0].sourceIndex, 8, 'h1 sourceIndex');

    t.same(tree.nodes[1].nodes[1].source.start.line, 2, ':after start line');
    t.same(tree.nodes[1].nodes[1].source.start.column, 4, ':after start column');
    t.same(tree.nodes[1].nodes[1].source.end.column, 9, ':after end column');
    t.same(tree.nodes[1].nodes[1].sourceIndex, 10, ':after sourceIndex');

    t.same(tree.nodes[2].nodes[0].source.start.line, 3, '.two start line');
    t.same(tree.nodes[2].nodes[0].source.start.column, 3, '.two start column');
    t.same(tree.nodes[2].nodes[0].source.end.column, 6, '.two end column');
    t.same(tree.nodes[2].nodes[0].sourceIndex, 20, '.two sourceIndex');
});

test('pseudo with arguments spanning multiple lines', 'h1:not(\n\t.one,\n\t.two\n)', (t, tree) => {
    t.same(tree.nodes[0].nodes[1].source.start.line, 1, ':not start line');
    t.same(tree.nodes[0].nodes[1].source.start.column, 3, ':not start column');
    t.same(tree.nodes[0].nodes[1].source.end.line, 4, ':not end line');
    t.same(tree.nodes[0].nodes[1].source.end.column, 1, ':not end column');
    t.same(tree.nodes[0].nodes[1].sourceIndex, 2, ':not sourceIndex');

    t.same(tree.nodes[0].nodes[1].nodes[0].nodes[0].source.start.line, 2, '.one start line');
    t.same(tree.nodes[0].nodes[1].nodes[0].nodes[0].source.start.column, 2, '.one start column');
    t.same(tree.nodes[0].nodes[1].nodes[0].nodes[0].source.end.line, 2, '.one end line');
    t.same(tree.nodes[0].nodes[1].nodes[0].nodes[0].source.end.column, 5, '.one end column');
    t.same(tree.nodes[0].nodes[1].nodes[0].nodes[0].sourceIndex, 9, '.one sourceIndex');

    t.same(tree.nodes[0].nodes[1].nodes[1].nodes[0].source.start.line, 3, '.two start line');
    t.same(tree.nodes[0].nodes[1].nodes[1].nodes[0].source.start.column, 2, '.two start column');
    t.same(tree.nodes[0].nodes[1].nodes[1].nodes[0].source.end.line, 3, '.two end line');
    t.same(tree.nodes[0].nodes[1].nodes[1].nodes[0].source.end.column, 5, '.two end column');
    t.same(tree.nodes[0].nodes[1].nodes[1].nodes[0].sourceIndex, 16, '.two sourceIndex');
});
