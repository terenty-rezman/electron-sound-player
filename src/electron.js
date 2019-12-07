const electron = require('electron')
const path = require('path')

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

let mainWindow = null; // global to avoid being gc'ed

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 500,
    minHeight: 200,
    minWidth: 200,
    backgroundColor: '#fff',
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    // disable default menu + default hotkeys when in production
    if (process.env.WEBPACK_MODE === 'production')
      Menu.setApplicationMenu(null);

    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.WEBPACK_MODE === 'production')
    mainWindow.loadFile('./build/index.html');
  else
    mainWindow.loadURL('http://localhost:3132');

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});