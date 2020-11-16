import './styles/Login.css';
import { Component } from 'react';

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pop: 1
        }
    }

    render() {
        return (
            <form action="index.html" className="form-box">
                <h1 className="form-title">CODES</h1>
                
                <div className="form-element">
                    <p className="form-label"><b>CORREO ELECTRÓNICO</b></p>
                    <input className="form-input" type="text" placeholder=""/>
                </div>
        
                <div className="form-element">
                    <p className="form-label"><b>CONTRASEÑA</b></p>
                    <input className="form-input" type="password" placeholder=""/>
                    <p className="text"><a href="#">¿Olvidaste tu contraseña?</a></p>
                </div>
        
                <button className="submit-button" type="submit"><b>INICIAR SESIÓN</b></button>
                <p className="text">¿Eres nuevo? <a href="#">Registrate aquí</a></p>
            </form>
        );
    }
}

export default Login;