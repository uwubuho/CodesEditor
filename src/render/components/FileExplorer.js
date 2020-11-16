import './styles/FileExplorer.css';
import { Component } from 'react';

class FileExplorer extends Component {
    render() {
        return (
            <div className="FileExplorer">
                <div class="explorer-text"><div>EXPLORER</div></div>
                <div class="files">
                    <div id="file-1" class="file">
                        <div class="file-text">example.js</div>
                    </div>
                    <div id="file-2" class="file">
                        <div class="file-text">example.css</div>
                    </div>
                    <div id="file-3" class="file">
                        <div class="file-text">example.html</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FileExplorer;