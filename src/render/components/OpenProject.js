import './styles/OpenProject.css';
import { Component } from 'react';
import Workspace from './Workspace';
import FileExplorer from './FileExplorer';

class OpenProject extends Component {
    render() {
        return (
            <div className="OpenProject">
                <FileExplorer />
                <Workspace />
            </div>
        );
    }
}

export default OpenProject;