import './styles/Sidebar.css';
import { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

class Sidebar extends Component {
    render() {
        return (
            <div className="Sidebar">
                <div className="account" onClick={this.props.accountClick}>
                    <FontAwesomeIcon className="icon" icon={ faUser } />
                </div>
                <div className="project"><div className="project-letter">A</div></div>
            </div>
        );
    }
}

export default Sidebar;