export default complexAnalyzer

import createError from '../Tools/CreateError.js'

import { checkRelevance, checkKeywordSyntax } from './SyntaxChecker.js'

import typesName from '../TypesName.json' assert { type: 'json' }

//複雜分析器
function complexAnalyzer (codeSegment, type, filePath, location) {
  let state = {}

  let codeSegment2 = []
  let errors = []

  for (let i = 0; i < codeSegment.length; i++) {
    if (state.type === undefined) {
      if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '[') {
        state = { type: (codeSegment[i-1] === undefined || codeSegment[i-1].type === 'operator') ? 'array' : 'index', value: [[]], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
      } else if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '(') state = { type: 'parameters', value: [[]], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
      else if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '{') {
        if (codeSegment2[codeSegment2.length-1] !== undefined && codeSegment2[codeSegment2.length-1].type === 'parameters') state = { type: 'chunk', value: [], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
        else state = { type: 'object', value: [[]], line: codeSegment[i].line, layer: codeSegment[i].layer, start: codeSegment[i].start }
      } else codeSegment2.push(codeSegment[i])
    } else {
      if (state.type === 'array' || state.type === 'index') {
        if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ']' && codeSegment[i].layer === state.layer) {
          for (let i2 = 0; i2 < state.value.length; i2++) {
            let data = complexAnalyzer(state.value[i2], 'item', filePath, `<${typesName[state.type]}> 的第 ${i2} 項`)
            if (data.error) errors = errors.concat(data.errors)
            state.value[i2] = data.codeSegment
          }

          codeSegment2.push({ type: state.type, value: state.value, line: state.line, layer: state.layer, start: state.start, end: codeSegment[i].end })
          state = {}
        } else if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ',') state.value.push([])
        else state.value[state.value.length-1].push(codeSegment[i])
      } else if (state.type === 'parameters') {
        if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ')' && codeSegment[i].layer === state.layer) {
          for (let i2 = 0; i2 < state.value.length; i2++) {
            let data = complexAnalyzer(state.value[i2], 'item', filePath, `<參數列> 的第 ${i2} 項`)
            if (data.error) errors = errors.concat(data.errors)
            state.value[i2] = data.codeSegment
          }

          codeSegment2.push({ type: state.type, value: state.value, line: state.line, layer: state.layer, start: state.start, end: codeSegment[i].end })
          state = {}
        } else if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ',') state.value.push([])
        else state.value[state.value.length-1].push(codeSegment[i])
      } else if (state.type === 'chunk') {
        if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '}' && codeSegment[i].layer === state.layer) {
          let data = complexAnalyzer(state.value, 'chunk', filePath)
          if (data.error) errors = errors.concat(data.errors)
          codeSegment2.push({ type: 'chunk', value: data.codeSegment, line: state.line, layer: state.layer, start: state.start, end: codeSegment[i].end })
          state = {}
        } else state.value.push(codeSegment[i])
      } else if (state.type === 'object') {
        if (codeSegment[i].type === 'symbol' && codeSegment[i].value === '}' && codeSegment[i].layer === state.layer) {
          let object = {}
          if (state.value.length > 0 && state.value[0].length > 0) {
            if (state.value[state.value.length-1].length < 1) state.value.splice(state.value.length-1, 1)

            for (let i2 = 0; i2 < state.value.length; i2++) {
              let readOnly = false
              let name, value = []
              let valueIndex = 1

              if (state.value[i2][0].type === 'container') name = state.value[i2][0].value
              else if (state.value[i2][0].type === 'keyword' && state.value[i2][0].value === '唯讀') {
                readOnly = true
                if (state.value[i2][1] === undefined) errors.push(createError('compiler', `<物件> 中的 <鑰> 缺少名稱`, state.value[i2][0].start, state.value[i2][0].end, [{ file: filePath, line: state.value[i2][0].line, location: '<物件>' }]))
                else if (state.value[i2][1].type === 'container') name = state.value[i2][1].value
                else errors.push(createError('compiler', `<物件> 中的 <鑰> 只能為 <容器>`, state.value[i2][1].start, state.value[i2][1].end, [{ file: filePath, line: state.value[i2][1].line, location: '<物件>' }]))
                valueIndex = 2
              } else errors.push(createError('compiler', `多出了一個 <${typesName[state.value[i2][0].type]}> '${state.value[i2][0].value}'`, state.value[i2][0].start, state.value[i2][0].end, [{ file: filePath, line: state.value[i2][0].line, location: `<物件> 的項目 ${name}` }]))

              if (state.value[i2][valueIndex] !== undefined) {
                if (state.value[i2][valueIndex].type === 'symbol' && state.value[i2][valueIndex].value === ':') {
                  value = state.value[i2].slice(valueIndex+1, state.value[i2].length)
                 
                  if (value.length < 1) errors.push(createError('compiler', `多出了一個 : (無法指定後面的內容給項目 ${name}，因為後面沒有內容)`, state.value[i2][1].start, state.value[i2][valueIndex].end, [{ file: filePath, line: state.value[i2][valueIndex].line }]))
                  else {
                    let data = complexAnalyzer(value, 'item', filePath)
                    if (data.error) errors = errors.concat(data.errors)
                  }

                } else errors.push(createError('compiler', `多出了一個 <${typesName[state.value[i2][valueIndex].type]}> '${state.value[i2][valueIndex].value}'`, state.value[i2][1].start, state.value[i2][valueIndex].end, [{ file: filePath, line: state.value[i2][valueIndex].line, location: `<物件> 的項目 ${name}` }]))
              }

              object[name] = { readOnly, value }
            }
          }

          codeSegment2.push({ type: 'object', value: object, line: state.line, layer: state.layer, start: state.start, end: codeSegment[i].end })
        } else if (codeSegment[i].type === 'symbol' && codeSegment[i].value === ',') state.value.push([])
        else state.value[state.value.length-1].push(codeSegment[i])
      }
    }
  }

  if (type === 'chunk' && codeSegment2.length > 0) {
    for (let i = 1; i < codeSegment2[codeSegment2.length-1].line; i++) {
      let line = []

      for (let i2 = 0; i2 < codeSegment2.length; i2++) {
        if (codeSegment2[i2].line = i) line.push(codeSegment2[i2])
      }

      let data = checkKeywordSyntax(line, filePath, location)
      if (data.error) errors = errors.concat(data.errors)
      data = checkRelevance(line, filePath, location)
      if (data.error) errors = errors.concat(data.errors)
    }
  } else if (type === 'item' && codeSegment2.length > 0) {
    let data = checkKeywordSyntax(codeSegment2, filePath, location)
    if (data.error) errors = errors.concat(data.errors)
    data = checkRelevance(codeSegment2, filePath, location)
    if (data.error) errors = errors.concat(data.errors)
  }

  if (errors.length > 0 ) return { error: true, errors, codeSegment: codeSegment2 }
  else return { error: false, codeSegment: codeSegment2 }
}