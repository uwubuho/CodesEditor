const axios = require('axios');
var WebSocket = require('ws');

module.exports = class ConnectionManager
{
    constructor(endpoint)
    {
        this.authenticated = false;
        this.endpoint = endpoint;
        this.sockets = new Map();
        this.token = '';
    }

    setSocket(key, url)
    {
        var ws = new WebSocket('ws://' + this.endpoint + url, {
            headers : {
                authorization: this.token
            }
        });

        ws.connected = false;
        ws.on("open", () => {
            ws.connected = true;
        });

        ws.on("close", () => {
            ws.connected = false;
        });

        this.sockets.set(key, ws);
    }

    getSocket(key)
    {
        return this.sockets.get(key);
    }

    async authenticate(user, password)
    {
        var data = { "username": user, "password": password };
        var route = 'http://' + this.endpoint + '/api/login/';
        return await axios.post(route, data).then(response => {
            this.token = response.data.token;
            return this.token;
        }).catch(error => {
            if (error.response.status === 400) {
                console.log("Credenciales incorrectas");
            }
            throw error;
        })
    }

    async get(url)
    {
        var config = {
            headers: {
                Authorization: 'Token ' + this.token
            }
        }
        var route = 'http://' + this.endpoint + url;
        return await axios.get(route, config).then(response => {
            return response;
        }).catch(error => {
            if (error.response.status === 401) {
                console.log("No autenticado");
            }
            throw error;
        })
    }

    async post(url, data)
    {
        var config = {
            headers: {
                Authorization: 'Token ' + this.token
            }
        }
        var route = 'http://' + this.endpoint + url;
        return await axios.post(route, data, config).then(response => {
            return response;
        }).catch(error => {
            if (error.response.status === 401) {
                console.log("No autenticado");
            }
            throw error;
        });
    }

}