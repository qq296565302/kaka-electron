const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const ipcHandler = require('./ipcHandler')
const { createLogService } = require('./src/utils/logService')
const http = require('http')

// 创建日志服务实例，使用自定义日志目录
const logService = createLogService({
  logDir: 'D:/electron' // 默认日志目录
})

/**
 * 热更新工具，支持自动检测文件变化并刷新应用
 * 安装：npm install electron-reload --save-dev
 * __dirname：监听项目目录下的文件。
 * electron：指定 Electron 可执行文件路径。
 */

require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});

/**
 * 检查服务器是否可用
 * @param {string} url - 服务器URL
 * @param {number} maxRetries - 最大重试次数
 * @param {number} retryInterval - 重试间隔(毫秒)
 * @returns {Promise} - 返回Promise
 */
const checkServerAvailable = (url, maxRetries = 30, retryInterval = 1000) => {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const checkServer = () => {
      try {
        // 使用更简单的方式检查服务器
        const urlObj = new URL(url);
        const testSocket = new require('net').Socket();
        
        // 设置超时
        testSocket.setTimeout(1000);
        
        // 连接事件
        testSocket.connect(parseInt(urlObj.port), urlObj.hostname, () => {
          logService.info('App', `开发服务器可用: ${url}`);
          testSocket.destroy();
          resolve(true);
        });
        
        // 错误事件
        testSocket.on('error', (err) => {
          testSocket.destroy();
          retry();
        });
        
        // 超时事件
        testSocket.on('timeout', () => {
          testSocket.destroy();
          retry();
        });
      } catch (err) {
        retry();
      }
    };
    
    const retry = () => {
      retries++;
      if (retries >= maxRetries) {
        logService.error('App', `开发服务器连接失败，已达到最大重试次数: ${maxRetries}`);
        reject(new Error(`无法连接到开发服务器: ${url}`));
        return;
      }
      
      logService.info('App', `等待开发服务器启动，重试 ${retries}/${maxRetries}...`);
      setTimeout(checkServer, retryInterval);
    };
    
    checkServer();
  });
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    frame: false,
    opacity: 1,
    resizable: false, // 禁止改变主窗口尺寸
    icon: path.resolve(__dirname, 'resources/icon16.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // 先检查开发服务器是否可用，然后再加载URL
  const serverUrl = 'http://127.0.0.1:8769/';
  
  checkServerAvailable(serverUrl)
    .then(() => {
      win.loadURL(serverUrl);
      // 设置窗口是否可以由用户手动最大化。
      win.setMaximizable(false);
      // 记录应用启动日志
      logService.info('App', '应用窗口已创建并加载页面');
    })
    .catch((err) => {
      logService.error('App', '无法连接到开发服务器', err.message);
      // 显示错误页面或提示
      win.loadFile(path.join(__dirname, 'error.html'));
    });
}

app.whenReady().then(() => {
  // 记录应用启动日志
  logService.info('App', '应用启动')
  
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  /**
   * ipc 进程通信 (双向)
   */
  ipcMain.handle('copy-image-to-clipboard', ipcHandler.IPC_copyImageToClipboard)
  
  // 添加日志相关的IPC处理
  ipcMain.handle('log-info', (event, source, message, data) => {
    return logService.info(source, message, data)
  })
  
  ipcMain.handle('log-warn', (event, source, message, data) => {
    return logService.warn(source, message, data)
  })
  
  ipcMain.handle('log-error', (event, source, message, data) => {
    return logService.error(source, message, data)
  })
  
  ipcMain.handle('get-log-files', () => {
    return logService.getLogFiles()
  })
  
  ipcMain.handle('read-log-file', (event, filePath) => {
    return logService.readLogFile(filePath)
  })
})

app.on('window-all-closed', () => {
  // 记录应用关闭日志
  logService.info('App', '应用关闭')
  
  if (process.platform !== 'darwin') app.quit()
})
