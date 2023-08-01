//取得目錄名
export default (url) => {
  return path.dirname(fileURLToPath(url))
}

import { fileURLToPath } from 'url'
import path from 'path'