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

    async setSocket(key, url)
    {
        var ws = new WebSocket('ws://' + this.endpoint + url, {
            headers : {
                Authorization: 'Token ' + this.token
            }
        });

        ws.connected = false;
        ws.on("open", () => {
            ws.connected = true;
        });

        ws.on("close", () => {
            ws.connected = false;
        });

        ws.on("error", (e) => {
            ws.connected = false;
            this.sockets.delete(key);
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
            this.authenticated = true;
            return this.token;
        }).catch(error => {
            if (error.response.status === 400) {
                console.log("Credenciales incorrectas");
            }
            this.authenticated = false;
            throw error;
        })
    }

    async logout()
    {
        this.authenticated = false;
        this.token = '';
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
                this.authenticated = false;
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
                this.authenticated = false;
            }
            throw error;
        });
    }

}