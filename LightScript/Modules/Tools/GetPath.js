//取得絕對路徑
export default (basePath, move) => {
  let analysis = basePath.split(pathSymbol)
  move.forEach((item) => {
    if (item === '<') analysis.splice(analysis.length-1, 1)
    else analysis.push(item)
  })
  return analysis.join(pathSymbol)
}

import os from 'os'

let pathSymbol
if (os.platform() === 'linux' || os.platform() === 'darwin') pathSymbol = '/'
else if (os.platform() === 'win32') pathSymbol = '\\'
else throw new Error(`Light Script 不支援此平台 (${os.platform()})`)