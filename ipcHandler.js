const { BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')


/**
 * 使用fs.readFile异步读取文件
 * @param {*} filePath 
 * @returns 
 */
const readFilePromise = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}


/**
 * 加载单词本
 * @param {Event} event
 * @param {string} bookId 单词本 ID
*/
const IPC_LoadBook = async (event, bookId) => {
  // 获取当前文件所在目录
  const currentDir = __dirname
  // 构建JSON文件的完整路径
  const jsonFilePath = path.join(currentDir, 'public/Book', bookId + '.json')
  try {
    const book = await readFilePromise(jsonFilePath)
    return {
      code: 200,
      msg: '加载单词本成功',
      data: JSON.parse(book)
    }
  }
  catch (err) {
    return {
      code: 500,
      msg: '加载单词本失败'
    }
  }
  // console.log({ book: JSON.parse(book) })
}

module.exports = {
  IPC_LoadBook
}
