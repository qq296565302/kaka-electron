const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  copyImageToClipboard: (dataURL) => {
    const result = ipcRenderer.invoke('copy-image-to-clipboard', dataURL)
    return result
  },
  
  // 日志相关API
  log: {
    // 记录信息日志
    info: (source, message, data = null) => {
      return ipcRenderer.invoke('log-info', source, message, data)
    },
    
    // 记录警告日志
    warn: (source, message, data = null) => {
      return ipcRenderer.invoke('log-warn', source, message, data)
    },
    
    // 记录错误日志
    error: (source, message, data = null) => {
      return ipcRenderer.invoke('log-error', source, message, data)
    },
    
    // 获取所有日志文件列表
    getLogFiles: () => {
      return ipcRenderer.invoke('get-log-files')
    },
    
    // 读取指定日志文件内容
    readLogFile: (filePath) => {
      return ipcRenderer.invoke('read-log-file', filePath)
    }
  }
})
