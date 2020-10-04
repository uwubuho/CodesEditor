const WebSocket = require('ws');

var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.setFontSize(20);
editor.session.setMode("ace/mode/javascript");

var editorMirror = ace.edit("editor-mirror");
editorMirror.setTheme("ace/theme/twilight");
editorMirror.setFontSize(24);
editorMirror.session.setMode("ace/mode/javascript");

var connected = false;
const ws = new WebSocket('ws://codes-collab.herokuapp.com/ping/', {
    headers : {
        authorization: '67c03b6f6fb51a22af1c30c1b155cf20b9efae35'
    }
});

ws.on('open', function open() {
    connected = true;
});

ws.on('message', function incoming(data) {
    var event = JSON.parse(data);
    console.log(event);
    if(event.action === "insert")
    {
        text = event.lines.join('\n');
        editorMirror.session.insert({row: event.start.row, column: event.start.column}, text);
    }
    if(event.action === "remove")
    {
        editorMirror.session.remove(new ace.Range(event.start.row, event.start.column, event.end.row, event.end.column));
    }
});

ws.on('close', function close() {
    connected = false;
});

editor.session.on('change', function(e) {
    console.log(e);
    if(connected) {
        ws.send(JSON.stringify(e));
        //e.lines.forEach(text => ws.send(text));
    }
});