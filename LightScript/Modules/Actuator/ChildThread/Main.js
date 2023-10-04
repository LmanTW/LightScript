import { workerData } from 'worker_threads'
import path from 'path'
import fs from 'fs'

import Compiler from '../../../LightScriptEngine/Compiler/Main.js'

if (!fs.existsSync(workerData.mainFilePath)) throw new Error(`檔案 ${workerData.mainFilePath} 不存在`)
if (path.extname(workerData.mainFilePath) !== '.light') throw new Error(`檔案的副檔名必須為 .light`)

let compiler = new Compiler()
let codeSegment = compiler.compile(fs.readFileSync(workerData.mainFilePath, 'utf-8'))