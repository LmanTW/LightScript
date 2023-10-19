//區塊管理器
export default class {
  #vm

  constructor (vm) {
    this.#vm = vm
  }

  //創建區塊
  createChunk (type, name, line, layer, codeSegment, parentChunkID, wait) {
    let id = generateID(5, Object.keys(this.#vm.vMem.read('chunks')))

    if (wait) this.#vm.vMem.write(`chunks.${parentChunkID}.childChunks`, id, 'push')

    this.#vm.vMem.write(`chunks.${id}`, {
      id,
      type,
      state: 'running',
      layer,

      name,
      line,

      codeSegment,
      executeData: {
        index: 0
      },
      containers: {},
      parentChunk: parentChunkID,
      childChunks: [],

      returnedData: undefined,
      returnData: { type: 'none', value: '無' }
    })

    this.#vm.taskManager.addTask(id)

    return id
  }

  //刪除資料
  deleteChunk (id) {
    let chunk = this.#vm.vMem.read(`chunks.${id}`)
    
    if (chunk.childChunks.length > 0) this.#vm.vMem.write(`chunks.${id}.state`, 'finish')
    else {
      this.#vm.vMem.delete(`chunks.${id}`)
      if (chunk.parentChunk !== undefined) this.deleteChunk(chunk.parentChunk)
    }
  }
}

import generateID from '../../Tools/GenerateID.js'