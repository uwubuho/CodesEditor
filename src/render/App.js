import './App.css';
import OpenProject from './components/OpenProject';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import { Component } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loginOpen: false
        }
        this.outLoginClick = this.outLoginClick.bind(this);
        this.accountClick = this.accountClick.bind(this);
    }

    accountClick(e) {
        this.setState({ loginOpen: true })
    }

    outLoginClick() {
        this.setState({ loginOpen: false })
    }

    render() {
        return (
            <div className="App">
                <Sidebar accountClick={this.accountClick} />
                <OpenProject />
                {this.state.loginOpen ? 
                    <Login
                        outLoginClick={this.outLoginClick}
                    /> 
                : null}
            </div>
        );
    }
}

export default App;
