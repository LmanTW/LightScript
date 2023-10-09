export default analyzeComplexType

import { checkRelevance, checkKeywordSyntax } from './SyntaxChecker.js'

import typesName from '../../TypesName.json' assert { type: 'json' }

//複雜分析器
async function analyzeComplexType (codeSegment, type, mode, filePath, detillPath) {
  let errors = []

  let state = {}

  let codeSegment2 = []
  let i = -1

  async function tick () {
    i++

    if (state.type === undefined) {
      if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '[') state = { type: (codeSegment2.length > 0) ? 'index' : 'array', value: [[]], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
      else if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '(') state = { type: 'parameters', value: [[]], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
      else codeSegment2.push(codeSegment[i])
    } else {
      if (state.type === 'index' || state.type === 'array') {
        if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ']' && codeSegment[i].layer === state.layer) {
          let data = await analyzeComplexType(state.value[state.value.length-1], 'single', mode, filePath, `<${typesName[state.type]}> 的第 ${state.value.length-1} 項`)
          errors = errors.concat(data.errors)
          state.value[state.value.length-1] = data.data

          codeSegment2.push(state)
          state = {}
        } else {
          if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ',' && codeSegment[i].layer === state.layer+1) {
            let data = await analyzeComplexType(state.value[state.value.length-1], 'single', mode, filePath, `<${typesName[state.type]}> 的第 ${state.value.length-1} 項`)
            errors = errors.concat(data.errors)
            state.value[state.value.length-1] = data.data

            state.value.push([])
          } else state.value[state.value.length-1].push(codeSegment[i])
        }
      } else if (state.type === 'parameters') {
        if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ')' && codeSegment[i].layer === state.layer) {
          for (let i = 0; i < state.value.length; i++) {
            let data = await analyzeComplexType(state.value[i], 'single', mode, filePath, `<參數列> 的第 ${i} 項`)
            errors = errors.concat(data.errors)
            state.value[i] = data.data
          }
          codeSegment2.push(state)
          state = {}
        } else {
          if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ',' && codeSegment[i].layer === state.layer+1) state.value.push([])
          else state.value[state.value.length-1].push(codeSegment[i])
        }
      }
    }
  }

  if (mode === 'instant') while (i < codeSegment.length-1) await tick()
  else await lazyLoop(() => i < codeSegment.length-1, tick)

  if (state.type === 'array' || state.type === 'index' || state.type === 'parameters') errors.push({ conecnt: `<${typesName[state.type]}> 無法閉合`, location: [{ file: filePath, detillPath, line: state.line, start: state.start, end: codeSegment[codeSegment.length-1].end }] })

  if (type === 'chunk') {
    let line = []

    let currentLine = 1
    codeSegment2.forEach((item) => {
      if (item.line === currentLine) line.push(item)
      else {
        errors = errors.concat(checkRelevance(line, filePath, detillPath).errors)
        line = []
      }
    })
    errors = errors.concat(checkRelevance(line, filePath, detillPath).errors)

    errors = errors.concat(checkKeywordSyntax(codeSegment2, filePath, detillPath).errors)
  } else if (type === 'single') {
    errors = errors.concat(checkRelevance(codeSegment2, filePath, detillPath).errors)
    errors = errors.concat(checkKeywordSyntax(codeSegment2, filePath, detillPath).errors)
  }

  return { error: errors.length > 0, errors, data: codeSegment2 }
}