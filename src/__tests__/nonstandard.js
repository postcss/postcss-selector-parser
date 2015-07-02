'use strict';

import {test} from './util/helpers';

test('non-standard selector', '.icon.is-$(network)', (t, tree) => {
    t.plan(4);
    t.equal(tree.nodes[0].nodes[0].value, 'icon');
    t.equal(tree.nodes[0].nodes[0].type, 'class');
    t.equal(tree.nodes[0].nodes[1].value, 'is-$(network)');
    t.equal(tree.nodes[0].nodes[1].type, 'class');
});
