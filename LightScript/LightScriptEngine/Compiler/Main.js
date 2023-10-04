//編譯器
export default class {
  #mode

  constructor (mode, filePath) {
    if (mode !== 'instant' && mode !== 'lazy') throw new Error('參數 mode 的值只能為 instant 或 lazy')

    this.#mode = mode
  }

  //編譯
  compile () {
    let codeSegment = analyzeSimpleType(code, mode, filePath)

    console.log(codeSegment)
  }
}

import analyzeSimpleType from './BasicAnalyzer.js'

let codeSegment = await analyzeSimpleType(`
ab
`, 'instant', 'hi')

console.log(codeSegment)