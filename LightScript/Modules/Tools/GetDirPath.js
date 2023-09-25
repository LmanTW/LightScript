import { fileURLToPath } from 'url'
import { dirname } from 'path'

//取得目錄路徑
export default (metaURL) => {
  return dirname(fileURLToPath(metaURL))
}