import ava from "./util/runner.mjs";
import stripCommentsModule from "../../dist/util/stripComments.js";

const stripComments = stripCommentsModule.default;

ava("stripComments()", (t) => {
    t.deepEqual(stripComments("aaa/**/bbb"), "aaabbb");
    t.deepEqual(stripComments("aaa/*bbb"), "aaa");
    t.deepEqual(stripComments("aaa/*xxx*/bbb"), "aaabbb");
    t.deepEqual(stripComments("aaa/*/xxx/*/bbb"), "aaabbb");
    t.deepEqual(stripComments("aaa/*x*/bbb/**/"), "aaabbb");
    t.deepEqual(stripComments("/**/aaa/*x*/bbb/**/"), "aaabbb");
    t.deepEqual(stripComments("/**/"), "");
});
