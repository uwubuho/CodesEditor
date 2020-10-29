var WebSocket = require('ws');

export class ConexionEditor 
{
    constructor(endpoint, url, auth)
    {
        this.endpoint = endpoint;
        this.auth = auth;
        this.url = url;
        this.ws = new WebSocket(endpoint + url, {
            headers : {
                authorization: auth
            }
        });

        this.ws.on("open", this.onOpen);
        this.ws.on("message", this.onMessage);
        this.ws.on("close", this.onClose);
    }

    send(message)
    {
        this.ws.send(message);
    }

    addEventListener(event, callback)
    {
        this.ws.on(event, callback);
    }

    onOpen = (e) => 
    {
        console.log("Connected");
    }

    onMessage = (e) => 
    {
    }

    onClose = (e) => 
    {
        console.log("Disconnected");
    }
}