import './styles/Workspace.css';
import { Component } from 'react';
import Editor from './Editor'

class Workspace extends Component {
    render() {
        return (
            <div className="Workspace">
                <div className="open-files">
                    <div id="file-1" className="open-file selected">
                        <div className="open-file-text">example.js</div>
                    </div>
                    <div id="file-2" className="open-file">
                        <div className="open-file-text">example.css</div>
                    </div>
                    <div id="file-3" className="open-file">
                        <div className="open-file-text">example.html</div>
                    </div>
                </div>
                <div className="open-file-route"><div>src {'>'} example.js</div></div>
                <Editor />
            </div>
        );
    }
}

export default Workspace;