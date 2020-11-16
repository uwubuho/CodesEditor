import './App.css';
import './utils/Popup.css';
import { Component } from 'react';
import OpenProject from './components/OpenProject';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Popup from './utils/Popup';

const { ipcRenderer } = window.require('electron');

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loginOpen: false, authenticated: false, username: '',
        }
        this.accountClick = this.accountClick.bind(this);
        this.ipcHandler = this.ipcHandler.bind(this);
    }

    ipcHandler() {
        ipcRenderer.on("set-auth", (e, ...args) => {
            this.setState({ authenticated: args[0] })
        })

        ipcRenderer.on("set-user-info", (e, ...args) => {
            this.setState({ username: args[0] })
        })
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
                    {!this.state.authenticated ? <Login /> : <h1>Autenticado como {this.state.username} <button onClick={() => {ipcRenderer.invoke("logout")}}>Salir</button></h1>}
                </Popup>
            </div>
        );
    }

    componentDidMount() {
        this.ipcHandler();
    }
}

export default App;
