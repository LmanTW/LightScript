import { workerData } from 'worker_threads'

import compile from '../Compiler/Main.js'

let options = workerData.options
let code = workerData.code

export { code, options }

(async () => {
  let codeSegment = compile(code)
  if (!Array.isArray(codeSegment)) {
  
  }
})()