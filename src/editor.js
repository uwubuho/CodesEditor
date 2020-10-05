const WebSocket = require('ws');
var applyDelta = require('ace/apply_delta').applyDelta;

var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.setFontSize(20);
editor.session.setMode("ace/mode/javascript");

var event_id = 0;
var events = new Map();

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
    var serverEvent = JSON.parse(data);
    updateClientOldEvents(serverEvent);
    if(events.has(serverEvent.event_id))
    {
        var clientEvent = events.get(serverEvent.event_id);
        revertEvent(clientEvent);
    }

    if(serverEvent.action === "insert")
    {
        text = serverEvent.lines.join('\n');
        myInsert({row: serverEvent.start.row, column: serverEvent.start.column}, text, editor.session);
    }
    if(serverEvent.action === "remove")
    {
        myRemove(new ace.Range(serverEvent.start.row, serverEvent.start.column, serverEvent.end.row, serverEvent.end.column), editor.session);
    }
});

ws.on('close', function close() {
    connected = false;
});

function onEditorChange(e) {
    e.event_id = event_id;
    events.set(event_id, e);
    event_id++;

    if(connected) {
        ws.send(JSON.stringify(e));
    }
}

function updateClientOldEvents(newEvent)
{
    events.forEach((value, key) => {
        if(key < newEvent.event_id) 
        {
            if(newEvent.start.row == value.start.row && newEvent.end.row == value.end.row)
            {
                if(newEvent.start.column < value.start.column && newEvent.end.column < value.end.column)
                {
                    if(newEvent.action == "insert") {
                        value.start.column += newEvent.end.column - newEvent.start.column;
                        value.end.column   += newEvent.end.column - newEvent.start.column;
                    }
                    if(newEvent.action == "remove") {
                        value.start.column -= newEvent.end.column - newEvent.start.column;
                        value.end.column   -= newEvent.end.column - newEvent.start.column;
                    }
                }
    
            }
    
            if(newEvent.start.row < value.start.row) 
            {
                if(newEvent.end.row < value.end.row)
                {
                    if(newEvent.action == "insert") {
                        value.start.row += newEvent.end.row - newEvent.start.row;
                        value.end.row += newEvent.end.row - newEvent.start.row;
                    }
                    if(newEvent.action == "remove") {
                        value.start.row -= newEvent.end.row - newEvent.start.row;
                        value.end.row -= newEvent.end.row - newEvent.start.row;
                    }
                }
                if(newEvent.end.row > value.start.row)
                {
    
                }
                if(newEvent.end.row > value.end.row)
                {
    
                }
            }
            if(newEvent.start.row > value.start.row) 
            {
                if(newEvent.end.row < value.end.row)
                {
    
                }
                if(newEvent.end.row < value.end.row)
                {
    
                }
            }

        }
    });
}

function revertEvent(e)
{
    if(e.action === "insert")
    {
        myRemove(new ace.Range(e.start.row, e.start.column, e.end.row, e.end.column), editor.session);
    }
    if(e.action === "remove")
    {
        myInsert({row: e.start.row, column: e.start.column}, e.lines.join('\n'), editor.session);
    }
    events.delete(e.event_id);
}

editor.session.doc.on('change', onEditorChange);


myRemove = function(range, session) {
    var start = session.doc.clippedPos(range.start.row, range.start.column);
    var end = session.doc.clippedPos(range.end.row, range.end.column);
    myApplyDelta({
        start: start,
        end: end,
        action: "remove",
        lines: session.doc.getLinesForRange({start: start, end: end})
    }, true, session.doc);
    return session.doc.clonePos(start);
};

myInsert = function(position, text, session) {
    if (session.doc.getLength() <= 1)
        session.doc.$detectNewLine(text);
        
    var lines = session.doc.$split(text);
    var start = session.doc.clippedPos(position.row, position.column);
    var end = {
        row: start.row + lines.length - 1,
        column: (lines.length == 1 ? start.column : 0) + lines[lines.length - 1].length
    };
    
    myApplyDelta({
        start: start,
        end: end,
        action: "insert",
        lines: lines
    }, true, session.doc);
    
    return session.doc.clonePos(end);
};

myApplyDelta = function(delta, doNotValidate, doc) {
    var isInsert = delta.action == "insert";
    if (isInsert ? delta.lines.length <= 1 && !delta.lines[0] : !ace.Range.comparePoints(delta.start, delta.end)) {
        return;
    }
    
    if (isInsert && delta.lines.length > 20000) {
        doc.$splitAndapplyLargeDelta(delta, 20000);
    }
    else {
        applyDelta(doc.$lines, delta, doNotValidate);
        editor.session.onChange(delta);
    }
};