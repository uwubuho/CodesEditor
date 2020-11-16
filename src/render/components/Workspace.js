import './styles/Workspace.css';
import { Component } from 'react';
import Editor from './Editor'

class Workspace extends Component {
    render() {
        return (
            <div className="Workspace">
                <div class="open-files">
                    <div id="file-1" class="open-file selected">
                        <div class="open-file-text">example.js</div>
                    </div>
                    <div id="file-2" class="open-file">
                        <div class="open-file-text">example.css</div>
                    </div>
                    <div id="file-3" class="open-file">
                        <div class="open-file-text">example.html</div>
                    </div>
                </div>
                <div class="open-file-route"><div>src {'>'} example.js</div></div>
                <Editor />
            </div>
        );
    }
}

export default Workspace;