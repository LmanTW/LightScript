import path from 'path'
import fs from 'fs'

//執行器 API
export default class {
  #options
  #data

  #events = {}

  constructor (mainFilePath, options) {
    if (typeof mainFilePath !== 'string') throw new Error('參數 mainFilePath 必須為一個 <string>')
    if (!fs.existsSync(mainFilePath)) throw new Error(`檔案 ${mainFilePath} 不存在`)
    if (path.extname(mainFilePath) !== '.light') throw new Error(`檔案的副檔名必須為 .light`)

    this.#options = Object.assign(defaultOptions, options)

    checkObjectValue('options', {
      'maxTaskPerExecution': { type: ['number'], moreThan: 0 },
      'maxVirtualMemory': { type: ['number'], moreThan: 0 },

      'executionType': { equal: ['instant', 'lazy'] }, 
      'executionInterval': '0',

      'logToConsole': { type: ['boolean'] },
      'saveLog': { type: ['boolean'] },
      'actuatorLog': { type: ['boolean'] },

      'virtualDisk': { type: ['undefined', 'string'] },
      'maxVirtualDiskSpace': { type: ['undefined', 'number'] }
    }, this.#options)

    this.#data = {
      mainFilePath,

      workerHandler: undefined,

      state: 'idle',
      logs: []
    }
  }

  get state () {return this.#data.state}

  //運行執行器
  run () {
    if (this.#data.state !== 'idle') throw new Error(`無法執行執行器，因為執行器現在的狀態為 ${this.#data.state}`)

    this.#data.workerHandler = new WorkerHandler(this.#data.mainFilePath, this.#options)
  }

  #workerMessageHandler = (msg) => {
  
  }
}

import checkObjectValue from '../../Tools/CheckObjectValue.js'

import WorkerHandler from './WorkerHandler.js'

import defaultOptions from '../../DefaultOptions.json' assert { type: 'json' }
