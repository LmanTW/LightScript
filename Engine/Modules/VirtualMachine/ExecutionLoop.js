//執行循環
export default class {
  #vm

  constructor (vm) {
    this.#vm = vm

    if (vm.options.executionType === 'instant') while (vm.taskManager.tasks.length > 0) this.#execute()
    else lazyLoop(vm.taskManager.tasks.length > 0, () => this.#execute())
  }

  //執行
  #execute () {
    this.#vm.taskManager.getTaskInExecution().forEach((item) => {
      let chunk = this.#vm.vMem.read(`chunks.${item}`)
      if (chunk.state === 'running') {
        let codeSegment = this.#vm.vMem.read(`codeSegments.${chunk.codeSegment}`)
        let data = codeSegment[chunk.executeData.index]

        if (chunk.executeData.index >= codeSegment.length) this.#vm.chunkManager.deleteChunk(chunk.id)
      }
    })
    this.#vm.taskManager.next()
  }
}

import lazyLoop from '../../Tools/LazyLoop.js'