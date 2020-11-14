const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');

const CodesApplication = require('./codes-application.js')

if (require('electron-squirrel-startup')) {
	app.quit();
}

async function createWindow() {
	
	var options = { endpoint : 'codes-collab.herokuapp.com' }
	var codes = new CodesApplication(options);
	await codes.connection.authenticate('dev', 'dev');

	ipcMain.handle('set-websocket', (event, ...args) => {
		codes.connection.setSocket(args[0], args[1]);
	});

	ipcMain.handle('set-ws-listener', (event, ...args) => {
		var ws = codes.connection.getSocket('debug');
		ws.on("message", (e) => {
			event.sender.send('ws-message', e);
		});
	});

	ipcMain.handle('ws-send', (event, ...args) => {
		var data = args[0];
		var ws = codes.connection.getSocket('debug');
		ws.send(data);
	});

	const mainWindow = new BrowserWindow({
		width: 1280, 
		height: 720,
		webPreferences: {
			worldSafeExecuteJavaScript: true,
			nodeIntegration: true,
		}
	});
	mainWindow.loadFile(path.join(__dirname, '..', 'render', 'main.html'));

	//mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);
app.on('window-all-closed', app.quit);