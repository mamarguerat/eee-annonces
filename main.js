const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const join = require('path').join;
const openAboutWindow = require('about-window').default;
const path = require('path');

const isMac = process.platform === 'darwin';

let mainWindow, adminWindow;

var menuTemplate = [
  // { role: 'appMenu' },
  ...(isMac
    ? [
      {
        label: app.name,
        submenu: [
          {
            label: 'About',
            click: () => aboutWindow()
          },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }
    ]
    : []),
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ]
        : [
          { role: 'close' }
        ])
    ]
  },
  ...(app.isPackaged
    ? []
    : [{ role: 'viewMenu' }]
  ),
  {
    role: 'help',
    submenu: [
      {
        label: 'A propos',
        click: () => aboutWindow()
      },
      {
        label: 'An savoir plus',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://martinmarguerat.ch')
        }
      },
      {
        label: 'Rapporter un bug',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://github.com/mamarguerat/eee-annonces/issues')
        }
      }
    ]
  },
];

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


const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
  
  if (!app.isPackaged) {
    process.env.NODE_ENV = 'development';
  }
  createWindows();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

function aboutWindow() {
  openAboutWindow({
    icon_path: (
      process.env.NODE_ENV === 'development'
        ? 'images/icon.png'
        : join(process.resourcesPath, 'images', 'icon.png')
    ),
    package_json_dir: (
      process.env.NODE_ENV === 'development'
        ? join(__dirname, 'images')
        : process.resourcesPath
    ),
    win_options: {
      parent: adminWindow,
      modal: true,
      titleBarStyle: "hidden",
      movable: false,
      resizable: false,
    },
    css_path: join(__dirname, "style.css"),
    bug_link_text: "Reporter un bug",
    product_name: "EEE annonces",
    show_close_button: "Fermer",
    adjust_window_size: true,
    description: "Affichage des annonces",
  })
}