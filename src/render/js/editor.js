var CodeMirror = require("codemirror");

var editor = CodeMirror(document.getElementById("editor"), {
    mode: "javascript",
    lineNumbers: true,
});