export default function stripComments (str) {
    let s = "";
    let commentStart = str.indexOf("/*");
    let lastEnd = 0;
    while (commentStart >= 0) {
        s = s + str.slice(lastEnd, commentStart);
        let commentEnd = str.indexOf("*/", commentStart + 2);
        if (commentEnd < 0) {
            return s;
        }
        lastEnd = commentEnd + 2;
        commentStart = str.indexOf("/*", lastEnd);
    }
    s = s + str.slice(lastEnd);
    return s;
}
