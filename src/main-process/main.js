const { app, BrowserWindow } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) {
	app.quit();
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1280, 
		height: 720,
		webPreferences: {
			nodeIntegration: true,
		}
	});
	mainWindow.loadFile(path.join(__dirname, '..', 'editor.html'));
	//mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);
app.on('window-all-closed', app.quit);