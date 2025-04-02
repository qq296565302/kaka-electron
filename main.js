const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const ipcHandler = require('./ipcHandler')

/**
 * 热更新工具，支持自动检测文件变化并刷新应用
 * 安装：npm install electron-reload --save-dev
 * __dirname：监听项目目录下的文件。
 * electron：指定 Electron 可执行文件路径。
 */

require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 800,
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
  ipcMain.handle('copy-image-to-clipboard', ipcHandler.IPC_copyImageToClipboard)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
