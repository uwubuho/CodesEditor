import './App.css';
import './utils/Popup.css';
import { Component } from 'react';
import OpenProject from './components/OpenProject';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Popup from './utils/Popup';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loginOpen: false
        }
        this.accountClick = this.accountClick.bind(this);
    }

    accountClick(e) {
        this.setState({ loginOpen: true })
    }

    render() {
        return (
            <div className="App">
                <Sidebar accountClick={this.accountClick} />
                <OpenProject />
                <Popup open={this.state.loginOpen} onClose={() => this.setState({ loginOpen: false })}>
                    <Login/>
                </Popup>
            </div>
        );
    }
}

export default App;
