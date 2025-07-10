const { app, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')

let mainWindow, adminWindow;

function createWindows() {
  adminWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'images', 'icon.png')
  })

  adminWindow.loadFile('admin.html')

  adminWindow.on('closed', () => {
    if (!mainWindow) return
    mainWindow.close();
    mainWindow = null; // Reset the reference
  });

  // Handle monitor detection and listing
  ipcMain.handle('get-displays', () => {
    return screen.getAllDisplays().map((d, i) => ({
      id: i,
      label: `Moniteur ${i + 1} (${d.bounds.width}x${d.bounds.height})`,
      bounds: d.bounds
    }));
  });

  // Dynamically update monitor list when displays change
  screen.on('display-added', () => {
    adminWindow.webContents.send('displays-updated', screen.getAllDisplays().map((d, i) => ({
      id: i,
      label: `Moniteur ${i + 1} (${d.bounds.width}x${d.bounds.height})`,
      bounds: d.bounds
    })));
  });

  screen.on('display-removed', () => {
    adminWindow.webContents.send('displays-updated', screen.getAllDisplays().map((d, i) => ({
      id: i,
      label: `Moniteur ${i + 1} (${d.bounds.width}x${d.bounds.height})`,
      bounds: d.bounds
    })));
  });

  ipcMain.on('create-main-window', (e, displayIndex) => {
    if (mainWindow) return

    const displays = screen.getAllDisplays();
    const selectedDisplay = displays[displayIndex] || displays[0];

    mainWindow = new BrowserWindow({
      fullscreen: true,
      x: selectedDisplay.bounds.x,
      y: selectedDisplay.bounds.y,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      },
      show: false,
      alwaysOnTop: true,
      focusable: false,
      icon: path.join(__dirname, 'images', 'icon.png')
    })

    mainWindow.loadFile('main.html')
  })
}

ipcMain.on('go-to-page', (e, index) => {
  if (mainWindow) mainWindow.webContents.send('go-to-page', index);
});

ipcMain.on('toggle-on-air', (e, state) => {
  if (state) {
    if (mainWindow) mainWindow.show();
  } else {
    if (mainWindow) {
      mainWindow.close();
      mainWindow = null;
    }
  }
});

ipcMain.on('toggle-blackout', (e, state) => {
  if (mainWindow) {
    mainWindow.webContents.send('toggle-blackout', state);
  }
});

ipcMain.on('auto-flip', (e, delay) => {
  if (mainWindow) mainWindow.webContents.send('auto-flip', delay);
});

ipcMain.on('stop-auto-flip', () => {
  if (mainWindow) mainWindow.webContents.send('stop-auto-flip');
});

app.whenReady().then(createWindows)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})