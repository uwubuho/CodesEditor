const { app, BrowserWindow } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

app.on('ready', createWindow);
app.on('window-all-closed', app.quit);