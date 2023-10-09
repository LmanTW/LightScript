//編譯器
export default class {
  #mode
  #filePath

  constructor (mode, filePath) {
    if (mode !== 'instant' && mode !== 'lazy') throw new Error('參數 mode 的值只能為 instant 或 lazy')

    this.#mode = mode
    this.#filePath = filePath
  }

  //編譯
  async compile (code) {
    let errors = []

    let data = await analyzeSimpleType(code, this.#mode, this.#filePath)
    errors = errors.concat(data.errors)
    data = await analyzeComplexType(data.data, 'chunk', this.#mode, this.#filePath)

    console.log(data)
  }
}

import analyzeComplexType from './ComplexAnalyzer.js'
import analyzeSimpleType from './BasicAnalyzer.js'