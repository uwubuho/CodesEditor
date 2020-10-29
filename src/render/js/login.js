

function iniciarSesion(){ 
    
    let email = document.querySelector('#email'); 
    let pass = document.querySelector('#pass'); 
       
    let xhr = new XMLHttpRequest(); 
    let url = 'https://codes-collab.herokuapp.com/api/login/';

    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-Type", "application/json"); 

    xhr.onreadystatechange = function () { 
        if (xhr.readyState === 4 && xhr.status === 200) { 

            //result.innerHTML = this.responseText; 
            console.log(this.responseText);
        } 
    }; 
    var data = JSON.stringify({ "username": email.value, "password": pass.value }); 
    xhr.send(data);
    
    return false;
} 