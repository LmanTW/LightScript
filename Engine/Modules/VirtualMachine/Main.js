//虛擬機
export default class {
  #options
  #data = {
    
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

    this.vMem.write('info', 1)
  }

  get state () {return this.#data.state}

  //執行
  async run () {
    
  }
}

import checkObjectValue from '../../Tools/CheckObjectValue.js'

import VirtualMemory from './VirtualMemory.js'