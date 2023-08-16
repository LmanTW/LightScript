//複雜分析器
export default (codeSegment, filePath) => {
  let state = {}
  let codeSegment2 = []

  for (let i = 0; i < codeSegment.length; i++) {
    if (state.type === undefined) {
      if (codeSegment[i].type === '[') {
        state = { type: (codeSegment[i-1] === undefined || codeSegment[i-1].type === 'operator') ? 'array' : 'index', value: [[]], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
      } else codeSegment2.push(codeSegment[i])
    } else {
      if (state.type === 'array' || state.type === 'index') {
        if (codeSegment[i].type === ']' && codeSegment[i].layer === state.layer) {
          console.log(state.value)
        } else if (codeSegment[i].type === ',') state.value.push([])
        else state.value[state.value.length-1].push(codeSegment[i])
      }
    }
  }

  let data = 
  if ()
  return 
}

import { checkKeywordSyntax, check }