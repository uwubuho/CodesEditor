import React, { Component } from 'react';

class Popup extends Component {
    
    constructor(props) {
        super(props);
        this.state = { pop: 1 }
        this.onClick = this.onClick.bind(this);
    }

    onClick(e) {
        if(e.target === e.currentTarget) this.setState({ pop: 0 });
    }
    
    render() {
        if(this.props.open)
            return (
                <div className="Container" onClick={this.onClick}>
                    <div className="Content modalPop" onAnimationEnd={() => {if(!this.state.pop) {this.props.onClose(); this.setState({ pop: 1 })}}} pop={this.state.pop}>
                        {this.props.children}
                    </div>
                </div>
            );
        else return null;
    }
}

export default Popup;