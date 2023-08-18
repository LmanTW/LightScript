import path from 'path'
import os from 'os'

//取得錯誤的輸出內容
export default (data) => {
  let string = ''

  if (data.type === 'compiler') string = `[編譯錯誤]: ${data.content}\n` 
  else if (data.type === 'actuator') string = `[執行錯誤]: ${data.content}\n` 
  string+=`｜檔案: ${data.path[0].file}\n｜呼叫路徑:\n`

  let pathSymbol
  if (os.platform() === 'linux' || os.platform() === 'darwin') pathSymbol = '/'
  else if (os.platform() === 'win32') pathSymbol = '\\'
  else throw new Error(`Light Script 不支援此平台 (${os.platform()})`)

  let directoryPath
  data.path.forEach((item) => {
    if (directoryPath === undefined || item.file.split('pathSymbol').length < directoryPath.split('pathSymbol').length) directoryPath = item.file
  })
  directoryPath = `${path.dirname(directoryPath)}/`


  for (let i = data.path.length-1; i >= 0 && i >= data.path.length-10; i--) {
    string+=`｜｜${data.path[i].file.replace(directoryPath, '')} 的第 ${data.path[i].line} 行${(data.path[i].location === undefined) ? '' : ` [${data.path[i].location}]`}${(data.path[i].func === undefined) ? '' : ` (${data.path[i].func})`}`
  }
  
  return string
}