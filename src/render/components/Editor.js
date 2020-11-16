import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import './styles/Editor.css';
import { Component } from 'react';

class Editor extends Component {
    render() {
        return (
            <div className="EditorContainer">
                <CodeMirror 
                    options={{
                        mode: "javascript",
                        lineNumbers: true,
                      }}
                />
            </div>
        );
    }
}

export default Editor;