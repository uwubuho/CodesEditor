const { app, ipcMain, BrowserWindow } = require('electron');
const ConectionManager = require('./connection');
const path = require('path');

let hkEndpoint = 'codes-collab.herokuapp.com';
let localEndpoint = '127.0.0.1:8000';
let window;
let connection;

function createWindow() {

    connection = new ConectionManager(hkEndpoint);
    window = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    ipcMain.handle("authenticate", async (e, ...args) => {
        try {
            await connection.authenticate(args[0], args[1]);
            connection.get('/api/user_info/')
            .then((response) => {
                e.sender.send("set-user-info", response.data.name);
            }).catch((e) => {

            })
            e.sender.send("set-auth", true);
        } catch (error) {
            e.sender.send("set-auth", false);
            e.sender.send("set-user-info", '');
        }
    });

    ipcMain.handle("logout", async (e, ...args) => {
        connection.logout();
        e.sender.send("set-auth", false);
        e.sender.send("set-user-info", '');
    });

    window.loadURL('http://localhost:3000');
    //mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})