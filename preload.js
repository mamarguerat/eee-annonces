const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (dir) => ipcRenderer.send('navigate', dir),
  goToPage: (index) => ipcRenderer.send('go-to-page', index),
  toggleOnAir: (state) => ipcRenderer.send('toggle-on-air', state),
  autoFlip: (delay) => ipcRenderer.send('auto-flip', delay),
  stopAutoFlip: () => ipcRenderer.send('stop-auto-flip'),
  createMainWindow: (index) => ipcRenderer.send('create-main-window', index),
  onNavigate: (callback) => ipcRenderer.on('navigate', (_, dir) => callback(dir)),
  onGoToPage: (callback) => ipcRenderer.on('go-to-page', (_, index) => callback(index)),
  onAutoFlip: (callback) => ipcRenderer.on('auto-flip', (_, delay) => callback(delay)),
  onStopAutoFlip: (callback) => ipcRenderer.on('stop-auto-flip', callback),
  getDisplays: () => ipcRenderer.invoke('get-displays')
})