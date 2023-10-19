//虛擬機
export default class {
  #options
  #data = {
    state: 'idle',
    logs: []
  }

  constructor (options) {
    this.#options = Object.assign({
      "maxTaskPerExecution": 10,
      "maxVirtualMemory": 5000000,
    
      "executionType": "instant", 
      "executionInterval": "0",
    
      "logToConsole": true,
      "saveLog": false,
      "actuatorLog": false,
    
      "virtualDisk": null,
      "maxVirtualDiskSpace": null
    }, options)

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

    this.vMem = new VirtualMemory()
    this.taskManager = new TaskManager(this.#options.maxTaskPerExecution)
    this.chunkManager = new ChunkManager(this)
  }

  get options () {return this.#options}
  get state () {return this.#data.state}

  //運行
  async run (codeSegment) {
    if (this.#data.state === 'idle') {
      this.vMem.reset()
      this.taskManager.clear()

      this.vMem.write('', { codeSegments: { main: codeSegment }, chunks: {} })
      this.vMem.write('mainChunkID', this.chunkManager.createChunk('normal', 'main', undefined, '0', 'main', undefined, false))

      this.executionLoop = new ExecutionLoop(this)
    } else if (this.#data.state === 'pause') {
    
    } else throw new Error(`無法運運行虛擬機 (狀態: ${this.#data.state})`)
  }
}

import checkObjectValue from '../../Tools/CheckObjectValue.js'

import VirtualMemory from './VirtualMemory.js'
import ExecutionLoop from './ExecutionLoop.js'
import ChunkManager from './ChunkManager.js'
import TaskManager from './TaskManager.js'