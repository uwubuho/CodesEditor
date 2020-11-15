import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './__tests__/reportWebVitals';
import App from './render/App';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

reportWebVitals();
