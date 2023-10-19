//任務管理器
export default class {
  #maxTaskPerExecution
  #tasks = []
  #index = 0

  constructor (maxTaskPerExecution) {
    this.#maxTaskPerExecution = maxTaskPerExecution
  }

  get tasks () {return this.#tasks}
  get index () {return this.#index}

  //清除任務
  clear () {
    this.#tasks = []
  }

  //添加任務
  addTask (id) {
    this.#tasks.push(id)
  }

  //移除任務
  remove (id) {
    for (let i = this.#tasks.length-1; i >= 0; i--) {
      if (this.#tasks[i] === id) this.#tasks.splice(i, 1)
    }
  }

  //取得該執行的任務
  getTaskInExecution () {
    return this.#tasks.slice(this.#index*this.#maxTaskPerExecution, (this.#index*this.#maxTaskPerExecution)+this.#maxTaskPerExecution)
  }

  //下一個執行
  next () {
    if (this.#index*this.#maxTaskPerExecution >= this.#tasks.length-1) this.#index = 0
    else this.#index++
  }
}