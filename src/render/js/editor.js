import { Identifier, Char, CharNode } from './char.js';
import { ConexionEditor } from './connection.js';

class LocalChange 
{
    constructor(from, to, text)
    {
        this.from = from;
        this.to = to;
        this.text = text;
    }
}

//TEST/////////////////////////////////////////////////////////////
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
            return node.data.position && node.data.name ? `<div class='TreeNode'> '${node.data.name}' -> ${node.data.position}</div>` : "";
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
//////////////////////////////////////////////////////////////

var CodeMirror = require("codemirror");

var connected = false;
var endpointHk = 'ws://codes-collab.herokuapp.com';
var endpointLocal = 'ws://127.0.0.1:8000';
var url = '/ping/';
var token = '67c03b6f6fb51a22af1c30c1b155cf20b9efae35';
var socket = new ConexionEditor(endpointHk, url, token);
var rootCharNode = null;
var clientID = -1;

var a = [];
var eventQueue = [];
var eventCount = 0;

var clientMarks = new Map();

var editor = CodeMirror(document.getElementById("editor"), {
    mode: "javascript",
    lineNumbers: true,
});
var doc = editor.getDoc();
var cursor = doc.getCursor();

editor.on("beforeChange", (editor, event) => {
    if(!connected)
    {
        event.cancel();
        return;
    }
    
    if(event.origin == "+delete" || event.origin == "cut")
    {
        event.cancel();
        var deletion = new LocalChange(event.from, event.to, "");
        doc.setCursor(deletion.from);
        if(editor.indexFromPos(deletion.to) == 0) return;
        var deletedText = doc.getRange(deletion.from, deletion.to);
    
        var fromIndex = doc.indexFromPos(deletion.from);
    
        for(var i = 0; i < deletedText.length; i++) {
    
            var from = doc.posFromIndex(fromIndex + i);
            var to = doc.posFromIndex(fromIndex + i + 1);
            var oldMarks = doc.findMarks(from, to);
            if(oldMarks.length > 0) return;
            var mark = doc.markText(from, to, {
                className: "clientRemoveText", 
                inclusiveLeft: false, 
                inclusiveRight: false, 
                clearWhenEmpty: true,
                attributes: { event: "delete" }
            });
            clientMarks.set(mark.id, mark);
            
            var node = CharNode.nodeFromIndex(fromIndex + i, rootCharNode);
            var position = node ? node.char.position : [];
            var payload = { origin : "delete", position : position, markID: mark.id  }
            var json = JSON.stringify(payload);
            socket.send(json);
        }
    }

    if(event.origin == "+input" || event.origin == "paste")
    {
        if(event.from == event.to) return;
        var deletedText = doc.getRange(event.from, event.to);
        var fromIndex = doc.indexFromPos(event.from);

        for(var i = 0; i < deletedText.length; i++) {
            var node = CharNode.nodeFromIndex(fromIndex + i, rootCharNode);
            var position = node ? node.char.position : [];
            var payload = { origin : "delete", position : position }
            var json = JSON.stringify(payload);
            socket.send(json);
        }
    }
});

editor.on("change", (editor, event) => {
    if(event.origin == "+input" || event.origin == "paste")
    {
        var insert = new LocalChange(event.from, event.to, event.text.join("\n"));
        var addedText = event.text.join("\n");
        var fromIndex = doc.indexFromPos(insert.from);
        for(var i = 0; i < addedText.length; i++)
        {
            var from = doc.posFromIndex(fromIndex + i);
            var to = doc.posFromIndex(fromIndex + i + 1);
            var mark = doc.markText(from, to, {
                className: "clientAddText", 
                inclusiveLeft: false, 
                inclusiveRight: false, 
                clearWhenEmpty: true,
                attributes: { event: "input" }
            });
            clientMarks.set(mark.id, mark);

            var rightNode = CharNode.nodeFromIndex(fromIndex + i, rootCharNode);
            var leftNode  = CharNode.nodeFromIndex(fromIndex + i - 1, rootCharNode);
            var rightPos, leftPos;
            rightPos = rightNode ? rightNode.char.position : [];
            leftPos  = leftNode  ? leftNode.char.position  : [];
            var pos = CharNode.generarPos(leftPos, rightPos, clientID);
            var char = new Char(pos, 0, addedText[i]);
            var node = CharNode.insert(char, rootCharNode);
            if(!rootCharNode) rootCharNode = node;
            var payload = { origin : "insert", char : char, markID: mark.id }
            var json = JSON.stringify(payload);
            socket.send(json);
        }
    }
});

socket.addEventListener("message", (e) => {
    var serverEvent = JSON.parse(e);
    console.log(serverEvent)
    if(serverEvent.type == "presence_accept")
    {
        clientID = serverEvent.client_id;
    }
    else if(serverEvent.type == "input")
    {
        var inputEvent = serverEvent.data;
        if(inputEvent.origin == "insert")
        {
            try {
                try {
                    var node = CharNode.insert(inputEvent.char, rootCharNode);
                    if(!rootCharNode) rootCharNode = node;
                    var index = CharNode.indexFromNode(node);
                } catch {}
                var mark = doc.getAllMarks().find(mark => mark.id == inputEvent.markID);
                if(mark)
                {
                    if(mark.attributes.event == "input")
                    {
                        var pos = mark.find();
                        var from = pos.from;
                        var to = pos.to;
                        var value = inputEvent.char.value;
                        doc.replaceRange(value, from, to);
                    }
                }
                else if(serverEvent.client_id != clientID)
                {
                    var place = editor.posFromIndex(index);
                    var value = inputEvent.char.value;
                    doc.replaceRange(value, place, place);
                }
                
            } catch (error) {
                console.log("error: ", error);
            }
        }
        if(inputEvent.origin == "delete")
        {
            try {
                var rootPos = rootCharNode ? rootCharNode.char.position : [];
                var node = CharNode.find(inputEvent.position, rootCharNode);
                var index = CharNode.indexFromNode(node);
                var mark = doc.getAllMarks().find(mark => mark.id == inputEvent.markID);
                if(mark)
                {
                    var pos = mark.find();
                    var from = pos.from;
                    var to = pos.to;
                    doc.replaceRange('', from, to);
                }
                else if(serverEvent.client_id != clientID)
                {
                    var from = editor.posFromIndex(index);
                    var to = editor.posFromIndex(index+1);
                    doc.replaceRange('', from, to);
                }
                var newNode = CharNode.delete(node);
                if(JSON.stringify(inputEvent.position) == JSON.stringify(rootPos)) rootCharNode = newNode;
            } catch (error) {
                console.log("error: ", error);
            }
        }
        myTree.refresh(CharNode.obtenerEstructuraArbol(rootCharNode), { duration: 0 });
    }
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