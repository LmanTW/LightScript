//虛擬記憶體
export default class {
  #data = {}
  #size = 0

  get size () {return this.#size}

  //寫入虛擬記憶體
  write (address, value, type) {
    let target = this.read(address)
    if (target !== undefined) this.#size-=getVariableSize(target)

    let data
    if (type === undefined || type === 'set') data = value
    else if (type === 'add') data = target+value
    else if (type === 'subtract') data = target-value

    target = this.#data

    let keys = address.split('.')
    keys.forEach((item, index) => {
      if (index < keys.length-1) target = target[item]
    })

    target[keys[keys.length-1]] = data
    this.#size+=getVariableSize(data)

    console.log(this.#data, this.#size)
  }

  //讀取虛擬記憶體
  read (address) {
    let target = this.#data
    address.split('.').forEach((item) => target = target[item])

    return target
  }
}

import getVariableSize from '../../Tools/GetVariableSize.js'