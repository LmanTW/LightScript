//虛擬記憶體
export default class {
  #data = {}
  #size = 0

  get size () {return this.#size}

  //重置虛擬記憶體
  reset () {
    this.#data = {}
    this.#size = 0
  }

  //寫入虛擬記憶體
  write (address, value, type) {
    let target = this.read(address)
    if (target !== undefined) this.#size-=getVariableSize(target)

    let data
    if (type === undefined || type === 'set') data = value
    else if (type === 'add') data = target+value
    else if (type === 'subtract') data = target-value
    else if (type === 'push') {
      target.push(data)
      data = target
    }

    let keys = address.split('.')
    if (keys[0] === '') this.#data = data
    else {
      target = this.#data
      keys.forEach((item, index) => {
        if (index < keys.length-1) target = target[item]
      })

      target[keys[keys.length-1]] = data
    }

    this.#size+=getVariableSize(data)
  }

  //讀取虛擬記憶體
  read (address) {
    if (address === '') return this.#data

    let target = this.#data
    address.split('.').forEach((item) => target = target[item])

    return target
  }

  //刪除虛擬記憶體
  delete (address) {
    let target = this.#data

    let keys = address.split('.')
    keys.forEach((item, index) => {
      if (index < keys.length-1) target = target[item]
    })

    delete target[keys[keys.length-1]]
  }
}

import getVariableSize from '../../Tools/GetVariableSize.js'