const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const ipcHandler = require('./ipcHandler')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 576,
    frame: false,
    opacity: 1,
    resizable: false, // 禁止改变主窗口尺寸
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadURL('http://127.0.0.1:8769/')

  // 设置窗口是否可以由用户手动最大化。
  win.setMaximizable(false)

}
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  /**
   * ipc 进程通信 (双向)
   */
  ipcMain.handle('load-book', ipcHandler.IPC_LoadBook)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
