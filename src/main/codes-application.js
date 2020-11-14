const { BrowserWindow, app, ipcMain } = require('electron');
const path = require('path');

const ConnectionManager = require('./connection.js');

module.exports = class CodesApplicaton {

    constructor(options)
    {
        this.connection = new ConnectionManager(options.endpoint);
    }

}