const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  goToPage: (index) => ipcRenderer.send('go-to-page', index),
  toggleOnAir: (state) => ipcRenderer.send('toggle-on-air', state),
  createMainWindow: (index) => ipcRenderer.send('create-main-window', index),
  onGoToPage: (callback) => ipcRenderer.on('go-to-page', (_, index) => callback(index)),
  onStopAutoFlip: (callback) => ipcRenderer.on('stop-auto-flip', callback),
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  toggleBlackout: (state) => ipcRenderer.send('toggle-blackout', state),
  onToggleBlackout: (cb) => ipcRenderer.on('toggle-blackout', (event, state) => cb(state)),
})