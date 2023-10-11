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
      else if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '{') {
        if (codeSegment2.length > 0 && (codeSegment2[codeSegment2.length-1].type === 'parameters' || (codeSegment2[codeSegment2.length-1].type === 'keyword' && codeSegment2[codeSegment2.length-1].value === '如果'))) state = { type: 'chunk', value: [], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
        else state = { type: 'object', value: [[]], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
      }
      else codeSegment2.push(codeSegment[i])
    } else {
      if (state.type === 'index' || state.type === 'array') {
        if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ']' && codeSegment[i].layer === state.layer) {
          let data = await analyzeComplexType(state.value[state.value.length-1], 'single', mode, filePath, `<${typesName[state.type]}> 的第 ${state.value.length-1} 項`)
          errors = errors.concat(data.errors)
          state.value[state.value.length-1] = data.data

          codeSegment2.push({ type: state.type, value: state.value, line: state.line, layer: state.layer, start: state.start, end: i })
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

          codeSegment2.push({ type: state.type, value: state.value, line: state.line, layer: state.layer, start: state.start, end: i })
          state = {}
        } else {
          if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ',' && codeSegment[i].layer === state.layer+1) state.value.push([])
          else state.value[state.value.length-1].push(codeSegment[i])
        }
      } else if (state.type === 'object') {
        if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '}' && codeSegment[i].layer === state.layer) {
          let object = {}
          state.value.forEach((item) => {
            let type
            let name, value
            
            if (item[0].type === 'keyword' && item[0].value === '唯讀') {
              if (item[1].type !== 'container') errors.push({ conecnt: '<物件> 項目的名稱只能為一個 <容器>', location: [{ file: filePath, detillPath, line: item[1].line, start: item[1].start, end: item[1].end }] })
              else if (item[2] !== undefined && (item[2].type !== 'symbol' || item[2].value !== ':')) errors.push({ conecnt: `多出了一個 <${typesName[item[2].type]}>`, location: [{ file: filePath, detillPath, line: item[2].line, start: item[2].start, end: item[2].end }] })
              else {
                type = 'readOnly'
                name = item[1].value
                if (item.length > 2) value = item.slice(3, item.length)
              }
            } else {
              if (item[0].type !== 'container') errors.push({ conecnt: '<物件> 項目的名稱只能為一個 <容器>', location: [{ file: filePath, detillPath, line: item[0].line, start: item[0].start, end: item[0].end }] })
              else if (item[1] !== undefined && (item[1].type !== 'symbol' || item[1].value !== ':')) errors.push({ conecnt: `多出了一個 <${typesName[item[1].type]}>`, location: [{ file: filePath, detillPath, line: item[1].line, start: item[1].start, end: item[1].end }] })
              else {
                type = 'normal'
                name = item[0].value
                if (item.length > 1) value = item.slice(2, item.length)
              }
            }

            if (value !== undefined) {
              let data = analyzeComplexType(value, 'single', mode, filePath, `<物件> 的項目 ${name}`)
              errors = errors.concat(data.errors)
            }

            object[name] = { type, value }
          })

          codeSegment2.push({ type: 'object', value: object, line: state.line, layer: state.layer, start: state.start, end: i })
          state = {}
        } else {
          if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ',' && codeSegment[i].layer === state.layer+1) {
            if (codeSegment[i+1] === undefined || (codeSegment[i+1].type === 'symbol' && codeSegment[i+1].value === '}') || (codeSegment[i+1].type === 'symbol' && codeSegment[i+1].value === ',')) errors.push({ conecnt: '多出了一個 <符號>', location: [{ file: filePath, detillPath, line: codeSegment[i-1].line, start: codeSegment[i-1].start, end: codeSegment[i-1].end }] })
            else state.value.push([])
          } else state.value[state.value.length-1].push(codeSegment[i])
        }
      } else if (state.type === 'chunk') {
        if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '}' && codeSegment[i].layer === state.layer) {
          let data = await analyzeComplexType(state.value, 'chunk', mode, filePath)
          errors = errors.concat(data.errors)
          state.value = data.data

          codeSegment2.push({ type: 'chunk', value: state.value, line: state.line, layer: state.layer, start: state.start, end: i })
          state = {}
        } else state.value.push(codeSegment[i])
      }
    }
  }

  if (mode === 'instant') while (i < codeSegment.length-1) await tick()
  else await lazyLoop(() => i < codeSegment.length-1, tick)

  if (state.type !== undefined) errors.push({ conecnt: `<${typesName[state.type]}> 無法閉合`, location: [{ file: filePath, detillPath, line: state.line, start: state.start, end: codeSegment[codeSegment.length-1].end }] })

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