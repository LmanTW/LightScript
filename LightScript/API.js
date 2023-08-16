import { Worker } from 'worker_threads'
import path from 'path'
import fs from 'fs'

//執行器
class Actuator {
  #options
  #data = {
    state: 'idle',
    log: [],
    mainFilePath: undefined,
    worker: undefined
  }
  #event = {}

  constructor (options) {
    if (options !== undefined && typeof options !== 'object') throw new Error(`參數 ${options} 必須為一個 <object>`)

    this.#options = Object.assign({
      //效能設定
      loopType: 'instant', //instant interval
      maxChunkPerExecution: 100,
      maxVirtualMemory: (1000000)*10,

      //輸出設定
      logToConsole: true,
      saveLog: false,
      actuatorLog: false,

      //虛擬硬碟
      virtualDisk: false, //將用戶可呼叫的範圍限制在path裡
      maxVirtualDiskSpace: 1000000000
    }, (options === undefined) ? {} : options)

    checkObjectValueType('options', {
      loopType: { value: ['instant', 'interval'] },
      maxChunkPerExecution: { type: ['number'], moreThan: 0 },
      maxVirtualMemory: { type: ['number'], moreThan: 0 },

      logToConsole: { type: ['boolean'] },
      saveLog: { type: ['boolean'] },
      actuatorLog: { type: ['boolean'] },

      virtualDisk: { type: ['boolean'] },
      maxVirtualDiskSpace: { type: ['number'], moreThan: 0 }
    }, this.#options)
  }

  get state () {return this.#data.state}

  //運行
  run (mainFilePath) {
    if (typeof mainFilePath !== 'string') throw new Error('參數 mainFilePath 必須為一個 <string>')
    if (!fs.existsSync(mainFilePath)) throw new Error(`找不到檔案 ${mainFilePath}`)
    if (path.extname(mainFilePath) !== '.light') throw new Error('檔案的副檔名必須為 .light')
    if (this.#data.state !== 'idle') throw new Error(`無法執行該執行器，因為執行器的狀態為 ${this.#data.state}`)

    this.#data.worker = new Worker(getPath(getDiretoryPath(import.meta.url), ['Modules', 'Actuator', 'Main.js']), { workerData: { mainFilePath, options: this.#options }})
    this.#data.worker.on('message', (msg) => this.#handleWorkerMessage(msg))
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

  //處理Worker的訊息
  #handleWorkerMessage (msg) {
    if (msg.type === 'event') this.#callEvent(msg.name, msg.data)
    
    this.#data.worker.postMessage({ type: 'return', messageID: msg.messageID })
  }

  //呼叫事件
  #callEvent (name, data) {
    if (name === 'state') this.#data.state = data 
    else if (name === 'log') {
      if (this.#options.logToConsole) console.log(`${(data.type === 'actuator') ? '[執行器]: ' : ''}${data.content}`)
      if (this.#options.saveLog) this.#data.log.push(data)
    }// else if (name === 'error') this.#callEvent('log', { type: 'normal', content: logError(data), location: {} })

    if (this.#event[name] !== undefined) Object.keys(this.#event[name]).forEach((item) => this.#event[name][item](data))
  }
}

export { Actuator }

import checkObjectValueType from './Modules/Tools/CheckObjectValueType.js'
import getDiretoryPath from './Modules/Tools/GetDirectoryPath.js'
import generateID from './Modules/Tools/GenerateID.js'
import getPath from './Modules/Tools/GetPath.js'