import { Worker } from 'worker_threads'

//Worker 處理器
export default class {
  #worker
  #requests = {}

  constructor (mainFilePath, options) {
    this.#worker = new Worker(getPath(getDirPath(import.meta.url), ['<', 'ChildThread', 'Main.js']), { workerData: { mainFilePath, options }})

    this.#worker.addListener('message', (msg) => {
      if (msg.type === 'reponse' && this.#requests[msg.requestID] !== undefined) {
        this.#requests[msg.requestID](msg.data)
        delete this.#requests[msg.requestID]
      }
    })
  }

  get worker () {return this.#worker}

  //發送請求
  async sendRequest (data) {
    return new Promise((resolve) => {
      let id = generateID(5, Object.keys(this.#requests))

      this.#requests[id] = (responseData) => resolve(responseData)
      
      this.#worker.postMessage(Object.assign(data, { requestID: id }))
    })
  }
}

import generateID from '../../Tools/GenerateID.js'
import getDirPath from '../../Tools/GetDirPath.js'
import getPath from '../../Tools/GetPath.js'