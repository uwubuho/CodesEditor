import './styles/Login.css';
import { Component } from 'react';

const { ipcRenderer } = window.require('electron'); 

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pop: 1,
            password: "",
            email: "",
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        ipcRenderer.invoke("authenticate", this.state.email, this.state.password);
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    render() {
        return (
            <form action="index.html" className="form-box" onSubmit={this.handleSubmit}>
                <h1 className="form-title">CODES</h1>
                
                <div className="form-element">
                    <p className="form-label"><b>CORREO ELECTRÓNICO</b></p>
                    <input name="email" className="form-input" type="text" placeholder="" onChange={this.handleInputChange}/>
                </div>
        
                <div className="form-element">
                    <p className="form-label"><b>CONTRASEÑA</b></p>
                    <input name="password" className="form-input" type="password" placeholder="" onChange={this.handleInputChange}/>
                    <p className="text"><a href="#">¿Olvidaste tu contraseña?</a></p>
                </div>
        
                <button className="submit-button" type="submit"><b>INICIAR SESIÓN</b></button>
                <p className="text">¿Eres nuevo? <a href="#">Registrate aquí</a></p>
            </form>
        );
    }
}

export default Login;