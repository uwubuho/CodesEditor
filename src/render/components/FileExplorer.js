import './styles/FileExplorer.css';
import { Component } from 'react';

class FileExplorer extends Component {
    render() {
        return (
            <div className="FileExplorer">
                <div className="explorer-text"><div>EXPLORER</div></div>
                <div className="files">
                    <div id="file-1" className="file">
                        <div className="file-text">example.js</div>
                    </div>
                    <div id="file-2" className="file">
                        <div className="file-text">example.css</div>
                    </div>
                    <div id="file-3" className="file">
                        <div className="file-text">example.html</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FileExplorer;