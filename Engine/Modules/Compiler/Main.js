//編譯器
export default class {
  //編譯
  static async compile (code, mode, filePath) {
    if (mode !== 'instant' && mode !== 'lazy') throw new Error('參數 mode 的值只能為 instant 或 lazy')

    let errors = []

    let data = await analyzeSimpleType(code, mode, filePath)
    errors = errors.concat(data.errors)
    data = await analyzeComplexType(data.data, 'chunk', mode, filePath)

    return data
  }
}

import analyzeComplexType from './ComplexAnalyzer.js'
import analyzeSimpleType from './BasicAnalyzer.js'