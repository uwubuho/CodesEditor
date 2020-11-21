import { Char, CharNode } from '../sync/char';

import CodeMirror from '@uiw/react-codemirror';
import './styles/Editor.css';
import { Component } from 'react';
var WebSocket = window.require('ws');

class Editor extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLocalFile: false,
            websocket: null,
            rootCharNode: null,
            clientID: -1,
            clientMarks: new Map(),
            editor: null,
        }

        this.onBeforeChange = this.onBeforeChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSocketMessage = this.onSocketMessage.bind(this);
    }

    componentDidMount() {
        var ws = new WebSocket('ws://codes-collab.herokuapp.com/echo/', {
            headers : {
                Authorization: 'Token f05d1e0164aa64bd17feb25191259754e457c99c'
            }
        });
        ws.on("message", this.onSocketMessage)
        this.setState({ websocket: ws })
    }

    render() {
        return (
            <div className="EditorContainer">
                <CodeMirror
                    options={{
                        mode: "javascript",
                        lineNumbers: true,
                    }}
                    onChange={this.onChange}
                    onBeforeChange={this.onBeforeChange}

                />
            </div>
        );
    }

    onBeforeChange(editor, event) {
        this.setState({ editor: editor })
        var doc = editor.getDoc();
        if (!this.state.websocket) { event.cancel(); return; }
        if (event.origin === "+delete" || event.origin === "cut") {
            event.cancel();
            doc.setCursor(event.from);
            if (editor.indexFromPos(event.to) === 0) return;
            var deletedText = doc.getRange(event.from, event.to);
            var fromIndex = doc.indexFromPos(event.from);

            for (var i = 0; i < deletedText.length; i++) {
                var from = doc.posFromIndex(fromIndex + i);
                var to = doc.posFromIndex(fromIndex + i + 1);
                var oldMarks = doc.findMarks(from, to);
                if (oldMarks.length > 0) return;
                var mark = doc.markText(from, to, {
                    className: "clientRemoveText",
                    inclusiveLeft: false,
                    inclusiveRight: false,
                    clearWhenEmpty: true,
                    attributes: { event: "delete" }
                });

                var node = CharNode.nodeFromIndex(fromIndex + i, this.state.rootCharNode);
                var position = node ? node.char.position : [];
                var payload = { origin: "delete", position: position, markID: mark.id }
                var json = JSON.stringify(payload);
                this.state.websocket.send(json);
            }
        }

        if (event.origin === "+input" || event.origin === "paste") {
            if (event.from === event.to) return;
            var deletedText = doc.getRange(event.from, event.to);
            var fromIndex = doc.indexFromPos(event.from);

            for (var i = 0; i < deletedText.length; i++) {
                var node = CharNode.nodeFromIndex(fromIndex + i, this.state.rootCharNode);
                var position = node ? node.char.position : [];
                var payload = { origin: "delete", position: position }
                var json = JSON.stringify(payload);
                this.state.websocket.send(json);
            }
        }
    }

    onChange(editor, event) {
        if (event.origin === "+input" || event.origin === "paste") {
            var doc = editor.getDoc();
            var addedText = event.text.join("\n");
            var fromIndex = doc.indexFromPos(event.from);
            for (var i = 0; i < addedText.length; i++) {
                var from = doc.posFromIndex(fromIndex + i);
                var to = doc.posFromIndex(fromIndex + i + 1);
                var mark = doc.markText(from, to, {
                    className: "clientAddText",
                    inclusiveLeft: false,
                    inclusiveRight: false,
                    clearWhenEmpty: true,
                    attributes: { event: "input" }
                });

                var rightNode = CharNode.nodeFromIndex(fromIndex + i, this.state.rootCharNode);
                var leftNode = CharNode.nodeFromIndex(fromIndex + i - 1, this.state.rootCharNode);
                var rightPos, leftPos;
                rightPos = rightNode ? rightNode.char.position : [];
                leftPos = leftNode ? leftNode.char.position : [];
                var pos = CharNode.generarPos(leftPos, rightPos, this.state.clientID);
                var char = new Char(pos, 0, addedText[i]);
                var node = CharNode.insert(char, this.state.rootCharNode);
                if (!this.state.rootCharNode) this.setState({ rootCharNode: node });
                var payload = { origin: "insert", char: char, markID: mark.id }
                var json = JSON.stringify(payload);
                this.state.websocket.send(json);
            }
        }

    }

    onSocketMessage(e) {
        var doc = this.state.editor.getDoc();
        var serverEvent = JSON.parse(e);
        if (serverEvent.type === "presence_accept") {
            this.setState({ clientID: serverEvent.client_id });
        }
        else if (serverEvent.type === "input") {
            var inputEvent = serverEvent.data;
            if (inputEvent.origin === "insert") {
                try {
                    try {
                        var node = CharNode.insert(inputEvent.char, this.state.rootCharNode);
                        if (!this.state.rootCharNode) this.setState({ rootCharNode: node });
                        var index = CharNode.indexFromNode(node);
                    } catch { }
                    var mark = doc.getAllMarks().find(mark => mark.id === inputEvent.markID);
                    if (mark) {
                        if (mark.attributes.event === "input") {
                            var pos = mark.find();
                            var from = pos.from;
                            var to = pos.to;
                            var value = inputEvent.char.value;
                            doc.replaceRange(value, from, to);
                        }
                    }
                    else if (serverEvent.client_id !== this.state.clientID) {
                        var place = this.state.editor.posFromIndex(index);
                        var value = inputEvent.char.value;
                        doc.replaceRange(value, place, place);
                    }

                } catch (error) {
                    console.log("error: ", error);
                }
            }
            if (inputEvent.origin === "delete") {
                try {
                    var rootPos = this.state.rootCharNode ? this.state.rootCharNode.char.position : [];
                    var node = CharNode.find(inputEvent.position, this.state.rootCharNode);
                    var index = CharNode.indexFromNode(node);
                    var mark = doc.getAllMarks().find(mark => mark.id === inputEvent.markID);
                    if (mark) {
                        var pos = mark.find();
                        var from = pos.from;
                        var to = pos.to;
                        doc.replaceRange('', from, to);
                    }
                    else if (serverEvent.client_id !== this.state.clientID) {
                        var from = this.state.editor.posFromIndex(index);
                        var to = this.state.editor.posFromIndex(index + 1);
                        doc.replaceRange('', from, to);
                    }
                    var newNode = CharNode.delete(node);
                    if (JSON.stringify(inputEvent.position) === JSON.stringify(rootPos)) this.setState({ rootCharNode: newNode });
                } catch (error) {
                    console.log("error: ", error);
                }
            }
        }

    }

}

export default Editor;