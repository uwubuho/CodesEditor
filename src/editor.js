import { Identifier, Char, CharNode } from './char.js';
import { ConexionEditor } from './connection.js';

//TEST
var Treeviz = require('treeviz');
var myTree = Treeviz.create({
    htmlId: "tree",
    idKey: "name",
    hasFlatData: false,
    relationnalField: "children",
    hasPan: true,
    hasZoom: true,
    renderNode: function(node) {
            //return `<div class='TreeNode'>${node.data.name}</div>`;
            return node.data.name ? `<div class='TreeNode'>${node.data.name}</div>` : "";
        },
    nodeWidth: 120,
    nodeHeight: 80,
    mainAxisNodeSpacing: 2,
    
    isHorizontal: false,
    linkWidth: (nodeData) => {
        //return 10;
        return nodeData.name ? 10 : 0;
    },
});

var CodeMirror = require("codemirror");

var connected = false;
var endpoint = 'ws://codes-collab.herokuapp.com';
var url = '/ping/';
var token = '67c03b6f6fb51a22af1c30c1b155cf20b9efae35';
var socket = new ConexionEditor(endpoint, url, token);
var rootCharNode = null;

var a = [];
var eventQueue = [];
var eventCount = 0;

var editor = CodeMirror(document.getElementById("editor"), {
    mode: "javascript",
    lineNumbers: true,
    theme: "twilight",
});
var doc = editor.getDoc();

/*var n0 = {"from":{"line":0,"ch":0},"to":{"line":0,"ch":0},"index":0,"origin":"+input","text":["X"]};
var n1 = {"from":{"line":0,"ch":1},"to":{"line":0,"ch":1},"index":1,"origin":"+input","text":["d"]};
var n2 = {"from":{"line":0,"ch":1},"to":{"line":0,"ch":2},"index":1,"origin":"+delete","text":[""]};
var n3 = {"from":{"line":0,"ch":1},"to":{"line":0,"ch":1},"index":1,"origin":"+input","text":["w"]};
var n4 = {"from":{"line":0,"ch":2},"to":{"line":0,"ch":2},"index":2,"origin":"+input","text":["a"]};
var n5 = {"from":{"line":0,"ch":2},"to":{"line":0,"ch":3},"index":2,"origin":"+delete","text":[""]};
var n6 = {"from":{"line":0,"ch":2},"to":{"line":0,"ch":2},"index":2,"origin":"+input","text":["d"]};
var n7 = {"from":{"line":0,"ch":2},"to":{"line":0,"ch":2},"index":2,"origin":"+input","text":["w"]};
var n8 = {"from":{"line":0,"ch":2},"to":{"line":0,"ch":3},"index":2,"origin":"+delete","text":[""]};
var n9 = {"from":{"line":0,"ch":2},"to":{"line":0,"ch":2},"index":2,"origin":"+input","text":["d"]};
var n10 = {"from":{"line":0,"ch":4},"to":{"line":0,"ch":4},"index":4,"origin":"+input","text":["Z"]};
//eventQueue = [ n0, n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, ] /**/

editor.on("beforeChange", (editor, event) => {
    if(event.origin == "+delete")
    {
        if(!connected)
        {
            event.cancel();
            return;
        }
        //event.cancel();
        var cursor = doc.getCursor();
        var indexCursor = editor.indexFromPos(cursor);
        var cursorBack = editor.posFromIndex(indexCursor - 1);
        doc.setCursor(cursorBack)
        var fromIndex = editor.indexFromPos(event.from);
        var toIndex = editor.indexFromPos(event.to);
        if(fromIndex == 0 && toIndex == 0) return;

        var oldMarks = doc.findMarks(event.from, event.to);
        oldMarks.forEach((e) => e.attributes.event = "delete");
        var mark = doc.markText(event.from, event.to, {
            className: "clientRemoveText", 
            inclusiveLeft: false, 
            inclusiveRight: false, 
            clearWhenEmpty: true,
            attributes: { event: "delete" }
        });

        var index = editor.indexFromPos(event.from);
        var from = { line: event.from.line, ch: event.from.ch }
        var to = { line: event.to.line, ch: event.to.ch }
        var newEvent = { from: from, to: to, index: index, origin: event.origin, text: event.text, markID: mark.id  }
        eventCount++;
        eventQueue.push(newEvent);
        
        a.push(newEvent);
        
        if(eventQueue.length == 1)
        {
            handleNextClientEvent();
        }
    }
    if(event.origin == "+input")
    {
        if(event.text.join('\n')[0] == '\n')
        {
            event.cancel();
            var index = editor.indexFromPos(event.from);
            var from = { line: event.from.line, ch: event.from.ch }
            var to = { line: event.to.line, ch: event.to.ch }
            var newEvent = { from: from, to: to, index: index, origin: event.origin, text: event.text }
            eventCount++;
            eventQueue.push(newEvent);
    
            if(eventQueue.length == 1)
            {
                handleNextClientEvent();
            }
        }
    }
});

editor.on("change", (editor, event) => {
    console.log(event);
    if(event.origin == "+input")
    {
        var to = { ...event.from };
        to.ch++;
        var mark = doc.markText(event.from, to, {
            className: "clientAddText", 
            inclusiveLeft: false, 
            inclusiveRight: false, 
            clearWhenEmpty: true, 
            atomic: true,
            attributes: { event: "input" }
        });
        
        var index = editor.indexFromPos(event.from);
        var from = { line: event.from.line, ch: event.from.ch }
        var to = { line: event.to.line, ch: event.to.ch }
        var newEvent = { from: from, to: to, index: index, origin: event.origin, text: event.text, markID: mark.id }
        eventCount++;
        eventQueue.push(newEvent);

        if(eventQueue.length == 1)
        {
            handleNextClientEvent();
        }
    }
});

function handleNextClientEvent()
{
    if(eventQueue.length < 1) return;
    var event = eventQueue[0];
    if(event.origin == "+input")
    {
        var index = event.index;
        var rightNode = CharNode.nodeFromIndex(index, rootCharNode);
        var leftNode  = CharNode.nodeFromIndex(index - 1, rootCharNode);
        var rightPos, leftPos;
        rightPos = rightNode ? rightNode.char.position : [];
        leftPos  = leftNode  ? leftNode.char.position  : [];
        var pos = CharNode.generarPos(leftPos, rightPos, 0);
        var text = event.text.join('\n')[0];
        var char = new Char(pos, 0, text);
        var payload = { origin : "insert", char : char, markID: event.markID }
        var json = JSON.stringify(payload);
        socket.send(json);
    }
    if(event.origin == "+delete")
    {
        var index = event.index;
        var node = CharNode.nodeFromIndex(index, rootCharNode);
        var position = node ? node.char.position : [];
        var payload = { origin : "delete", position : position, markID: event.markID  }
        var json = JSON.stringify(payload);
        socket.send(json);
    }
}

socket.addEventListener("message", (e) => {
    var serverEvent = JSON.parse(e);
    if(serverEvent.origin == "insert")
    {
        try {
            var node = CharNode.insert(serverEvent.char, rootCharNode);
            if(!rootCharNode) rootCharNode = node;
            var index = CharNode.indexFromNode(node);
            var mark = doc.getAllMarks().find(mark => mark.id == serverEvent.markID);
            if(mark)
            {
                if(mark.attributes.event == "input")
                {
                    var pos = mark.find();
                    var from = pos.from;
                    var to = pos.to;
                    var value = node.char.value;
                    doc.replaceRange(value, from, to);
                }
            }
            else
            {
                var place = editor.posFromIndex(index);
                var value = node.char.value;
                doc.replaceRange(value, place, place);
            }
            
        } catch (error) {
            console.log("error: ", error);
        }
    }
    if(serverEvent.origin == "delete")
    {
        try {
            var rootPos = rootCharNode ? rootCharNode.char.position : [];
            var node = CharNode.find(serverEvent.position, rootCharNode);
            var index = CharNode.indexFromNode(node);
            var mark = doc.getAllMarks().find(mark => mark.id == serverEvent.markID);
            if(mark)
            {
                var pos = mark.find();
                var from = pos.from;
                var to = pos.to;
                doc.replaceRange('', from, to);
            }
            else
            {
                var from = editor.posFromIndex(index);
                var to = editor.posFromIndex(index+1);
                doc.replaceRange('', from, to);
            }
            var newNode = CharNode.delete(node);
            if(JSON.stringify(serverEvent.position) == JSON.stringify(rootPos)) rootCharNode = newNode;
        } catch (error) {
            console.log("error: ", error);
        }
    }
    eventQueue.shift();
    handleNextClientEvent();
    myTree.refresh(CharNode.obtenerEstructuraArbol(rootCharNode), { duration: 0 });
});

socket.addEventListener("open", (e) => {
    connected = true;
    //doc.replaceRange('1', { line: 0, ch: 0 }, { line: 0, ch: 0 }, "+input")
    //doc.replaceRange('2', { line: 0, ch: 1 }, { line: 0, ch: 1 }, "+input")
    //doc.replaceRange('',  { line: 0, ch: 1 }, { line: 0, ch: 2 }, "+delete")
    //doc.replaceRange('3', { line: 0, ch: 1 }, { line: 0, ch: 1 }, "+input")
    //doc.replaceRange('4', { line: 0, ch: 2 }, { line: 0, ch: 2 }, "+input")
    //doc.replaceRange('',  { line: 0, ch: 2 }, { line: 0, ch: 3 }, "+delete")
    //doc.replaceRange('5', { line: 0, ch: 2 }, { line: 0, ch: 2 }, "+input")
    //doc.replaceRange('6', { line: 0, ch: 2 }, { line: 0, ch: 2 }, "+input")
    //doc.replaceRange('',  { line: 0, ch: 2 }, { line: 0, ch: 3 }, "+delete")
    //doc.replaceRange('7', { line: 0, ch: 2 }, { line: 0, ch: 2 }, "+input")
    //doc.replaceRange('8', { line: 0, ch: 4 }, { line: 0, ch: 4 }, "+input")
    //handleNextClientEvent();
})

socket.addEventListener("close", (e) => {
    connected = false;
})