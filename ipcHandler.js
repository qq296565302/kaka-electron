const { BrowserWindow, nativeImage, clipboard } = require('electron')
const fs = require('fs')
const path = require('path')


/**
 * 将图片写入剪贴板
 * @param {Event} event
 * @param {base64} dataURL 图片的dataURL
*/
const IPC_copyImageToClipboard = async (event, dataURL) => {
  try {
    const image = nativeImage.createFromDataURL(dataURL); // 将 Data URL 转为 Electron 的原生图片对象
    clipboard.writeImage(image); // 写入剪贴板
  } catch (error) {

  }
}

module.exports = {
  IPC_copyImageToClipboard
}
