
const { ipcRenderer } = require('electron')

function iniciarSesion(){ 
    
    let email = document.querySelector('#email'); 
    let pass = document.querySelector('#pass'); 
    
    ipcRenderer.invoke("login", email.value, pass.value);
} 