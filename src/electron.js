const electron = require('electron')
const path = require('path')

const protection = require('./protection')

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

let mainWindow = null; // global to avoid being gc'ed

function startup() {
  // protection not complete yet
  // const sn = protection.linux_getCurrentDriveSN();
  createWindow();
}

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
    // disable default menu + default hotkeys when in production & leave only devtools
    if (process.env.WEBPACK_MODE === 'production') {
      var menu = Menu.buildFromTemplate([
        {
          label: 'Menu',
          submenu: [
            {
              label: 'Developer tools',
              click() {
                mainWindow.webContents.openDevTools();
              },
              accelerator: 'CmdOrCtrl+Shift+I'
            }
          ]
        }
      ])
      Menu.setApplicationMenu(menu);
    }

    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.WEBPACK_MODE === 'production')
    mainWindow.loadFile('./build/index.html');
  else {
    const port = process.env.WEBPACK_DEV_SERV_PORT;
    mainWindow.loadURL(`http://localhost:${port}`);
  }

}

app.on('ready', startup)

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

