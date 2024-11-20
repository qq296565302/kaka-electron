const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadBook: (bookId) => {
    const result = ipcRenderer.invoke('load-book', bookId)
    return result
  }
})
