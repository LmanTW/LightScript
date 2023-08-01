import { Worker } from 'worker_threads'
import path from 'path'
import fs from 'fs'

export { Actuator }

import objectValueError from './Modules/Tools/ObjectValueError.js'
import getDirectoryPath from './Modules/Tools/GetDirectoryPath.js'
import generateID from './Modules/Tools/GenerateID.js'
import getPath from './Modules/Tools/GetPath.js'

//執行器
class Actuator {
  #options
  #data = {
    log: []
  }
  #event = {}

  constructor (mainFilePath, options) {
    if (typeof mainFilePath !== 'string') throw new Error('參數 mainFilePath 只能為 <string>')
    if (!fs.existsSync(mainFilePath)) throw new Error(`找不到檔案 ${mainFilePath}`)
    if (path.extname(mainFilePath) !== '.light') throw new Error(`檔案的副檔名必須為 .light`)

    this.#options = Object.assign({
      //效能設定
      loopType: 'instant', //instant interval
      maxChunkPerExecution: 100,
      maxVirtualMemorySpace: (1000000)*10,

      //輸出設定
      logToConsole: true,
      saveLog: false,
      actuatorLog: false,

      //虛擬硬碟
      virtualDisk: false, //將用戶可呼叫的範圍限制在path裡
      maxVirtualDiskSpace: 1000000000
    }, (options === undefined) ? {} : options)

    objectValueError('options', {
      loopType: { value: ['instant', 'interval'] },
      maxChunkPerExecution: { type: ['number'], moreThan: 0 },
      maxVirtualMemorySpace: { type: ['number'], moreThan: 0 },

      logToConsole: { type: ['boolean'] },
      saveLog: { type: ['boolean'] },
      actuatorLog: { type: ['boolean'] },

      virtualDisk: { type: ['boolean'] },
      maxVirtualDiskSpace: { type: ['number'], moreThan: 0 }
    }, this.#options)

    this.#data = {
      state: 'idle',
      worker: undefined,
      code: fs.readFileSync(mainFilePath, 'utf8'),
      log: []
    }
  }

  get state () {return this.#data.state}
  get log () {return this.#data.log}

  //運行執行器
  async run () {
    if (this.#data.state !== 'idle') throw new Error(`無法運行執行器 (執行器狀態: ${this.#data.state})`)

    this.#data.state = 'booting'
    this.#data.worker = new Worker(getPath(getDirectoryPath(import.meta.url), ['Modules', 'Actuator', 'Main.js']), { workerData: { options: this.#options, code: this.#data.code }})
    this.#data.worker.on('message', this.#handleWorkerMessage)
  }

  //聆聽事件
  event (name, callback) {
    if (typeof name !== 'string') throw new Error('參數 name 只能為 <string>')
    if (typeof callback !== 'function') throw new Error('參數 callback 只能為 <function>')

    if (this.#event[name] === undefined) this.#event[name] = {}
    let id = generateID(5, Object.keys(this.#event[name]))
    this.#event[name][id] = callback
    
    return {
      stop: () => {
        delete this.#event[name][id]
      }
    }
  }

  //處理Worker訊息
  #handleWorkerMessage (msg) {
    if (msg.type === 'event') {
      if (msg.name === 'log') {
        if (this.#data.options.logToConsole) console.log(msg.data.content)
        if (this.#data.options.saveLog) this.#data.log.push(msg.data)
      }
    }
    console.log(msg)
  }

  //呼叫事件
  #callEvent (name, data) {
    if (this.#event[name] !== undefined) Object.keys(this.#event[name]).forEach((item) => this.#event[name][item](data))
  }
}