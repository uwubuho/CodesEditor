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
            <div className="LoginContainer" onClick={(e) => {
                e.preventDefault();
                if(e.target === e.currentTarget) this.setState({ pop: 0 });
            }}>
                <form action="index.html" className="form-box modalPop" onAnimationEnd={() => {if(!this.state.pop) this.props.outLoginClick()}} pop={this.state.pop}>
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
            </div>
        );
    }
}

export default Login;