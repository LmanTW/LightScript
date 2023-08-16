//複雜分析器
export default (codeSegment, filePath) => {
  let state = {}

  let codeSegment2 = []
  let errors = []

  for (let i = 0; i < codeSegment.length; i++) {
    if (state.type === undefined) {
      if (codeSegment[i].type === '[') {
        state = { type: (codeSegment[i-1] === undefined || codeSegment[i-1].type === 'operator') ? 'array' : 'index', value: [[]], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
      } else codeSegment2.push(codeSegment[i])
    } else {
      if (state.type === 'array' || state.type === 'index') {
        if (codeSegment[i].type === ']' && codeSegment[i].layer === state.layer) {
          for (let i2 = 0; i2 < state.value.length; i2++) {
            let data = checkRelevance(state.value[i2], filePath)
            if (data.error) errors = errors.concat(data.errors)
            data = checkKeywordSyntax(state.value[i2], filePath)
            if (data.error) errors = errors.concat(data.errors)
          }
        } else if (codeSegment[i].type === ',') state.value.push([])
        else state.value[state.value.length-1].push(codeSegment[i])
      }
    }
  }

  return 
}

import { checkRelevance, checkKeywordSyntax } from './SyntaxChecker.js'