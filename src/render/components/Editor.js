import './styles/Editor.css';
import { Component } from 'react';
import CodeMirror from '@uiw/react-codemirror'

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