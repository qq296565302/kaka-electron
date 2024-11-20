// 使用 import.meta.glob 导入所有的 svg 文件
const importSvg = import.meta.glob('./*.svg', { eager: true });
const svg = {}
for (let path in importSvg) {
  const name = path.substring(path.lastIndexOf('-') + 1, path.lastIndexOf('.svg'))
  svg[name] = importSvg[path].default
}
export default svg
