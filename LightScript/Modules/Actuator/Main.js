import { workerData } from 'worker_threads'
import fs from 'fs'

const { mainFilePath, options } = workerData

export { mainFilePath, options }

import sendMessage from './WorkerMessage.js'
import compile from '../Compiler/Main.js'

//啟動執行器
(async () => {
  await sendMessage({ type: 'event', name: 'state', data: 'compiling' })

  let codeSegment = compile(fs.readFileSync(mainFilePath, 'utf8'), mainFilePath)
  if (codeSegment.error) await sendMessage({ type: 'event', name: 'error', data: codeSegment.errors[0] })
  
  console.log(codeSegment)
})()