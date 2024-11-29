const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  copyImageToClipboard: (dataURL) => {
    const result = ipcRenderer.invoke('copy-image-to-clipboard', dataURL)
    return result
  }
})
