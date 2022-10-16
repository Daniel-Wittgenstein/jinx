/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */


CodeMirror.defineSimpleMode("jinx", {
  
  start: [
    //note that highlighting a single line of JS does NOT work with simplemode.

    {sol: false, regex: /\<\</, token: "inline-js", mode: {spec: "javascript", end: /\>\>/}},

    {sol: false, regex: /\<\>/, token: "glue" },

    {sol: false, regex: /\<[\s\S]*?\>/, token: "html-tag" },


    {sol: true, regex: /\s*\.js/, token: "multi-line-js", mode: {spec: "javascript", end: /\.jsend/}},
    {sol: true, regex: /\s*\/\/.*/, token: "comment"},
    {sol: true, regex: /\s*\#.*/, token: "single-line-js"},
    {sol: true, regex: /\s*\=\=\=.*/, token: "knot-heading"},
    {sol: true, regex: /\s*\=.*/, token: "label"},
    {sol: true, regex: /\s*\..*/, token: "dot-command"},

    {sol: true, regex: /\s*\*.*/, token: "choice"},
    {sol: true, regex: /\s*\+.*/, token: "choice"},
    {sol: true, regex: /\s*\-.*/, token: "gather"},


  ],

  meta: {
    lineComment: "//"
  }
});