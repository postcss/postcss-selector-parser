import ava from "ava";
import stripComments from "../util/stripComments.js";

ava("stripComments()", (t) => {
    t.deepEqual(stripComments("aaa/**/bbb"), "aaabbb");
    t.deepEqual(stripComments("aaa/*bbb"), "aaa");
    t.deepEqual(stripComments("aaa/*xxx*/bbb"), "aaabbb");
    t.deepEqual(stripComments("aaa/*/xxx/*/bbb"), "aaabbb");
    t.deepEqual(stripComments("aaa/*x*/bbb/**/"), "aaabbb");
    t.deepEqual(stripComments("/**/aaa/*x*/bbb/**/"), "aaabbb");
    t.deepEqual(stripComments("/**/"), "");
});
