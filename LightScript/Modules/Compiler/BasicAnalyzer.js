//基礎分析器
export default (code) => {
  let state = {}
  let layer = 0
  let line = 1

  let codeSegment = []

  //切斷
  function breakOff (char, i) {
    if (state.type === 'string') state.value+=char
    else  {
      if (state.type === 'container') {
        if (state.value === '是' || state.value === '否') codeSegment.push({ type: 'boolean', value: state.value, line: state.line, layer: state.layer, start: state.start, end: i-1 })
        else if (keywords.includes(state.value)) codeSegment.push({ type: 'keyword', value: state.value, line: state.line, layer: state.layer, start: state.start, end: i-1 })
        else codeSegment.push({ type: 'container', value: state.value, line: state.line, layer: state.layer, start: state.start, end: i-1 })
      } else if (state.type !== undefined) codeSegment.push({ type: state.type, value: state.value, line: state.line, layer: state.layer, start: state.start, end: i-1 })
      state = {}
    }
  }

  for (let i = 0; i < code.length; i++) {
    if (code[i] === ' ') {
      breakOff(' ', i)
      state = {}
    } else if (code[i] === '\n') {
      breakOff('\n', i)
      line++
    } else if (code[i] === '(' || code[i] === '{' || code[i] === '[') {
      breakOff(code[i], i)
      codeSegment.push({ type: code[i], line, layer, start: i, end: i })
      layer++
    } else if (code[i] === ')' || code[i] === '}' || code[i] === ']') {
      breakOff(code[i], i)
      layer--
      codeSegment.push({ type: code[i], line, layer, start: i, end: i })
    } else if (state.type === undefined) {
      if (code[i] === "'" || code[i] === '"') state = { type: 'string', value: '', symbol: code[i], line, layer, start: i }
      else if ('1234567890'.includes(code[i])) state = { type: 'number', value: code[i], line, layer, start: i }
      else if ('+-*/=><!或且?'.includes(code[i])) state = { type: 'operator', value: code[i], line, layer, start: i }
      else state = { type: 'container', value: code[i], line, layer, start: i }
    } else {
      if (state.type === 'string') {
        if (code[i] === state.symbol) {
          codeSegment.push({ type: state.type, value: state.value, line: state.line, layer: state.layer, start: state.start, end: i })
          state = {}
        } else state.value+=code[i]
      } else if (state.type === 'number') {
        if (!'1234567890'.includes(code[i])) {
          breakOff('', i)
          i--
        } else state.value+=code[i]
      } else if (state.type === 'operator') {
        if (!operators.includes(state.value+code[i])) {
          if (state.value === '-' && '1234567890'.includes(code[i])) state.type = 'number'
          else {
            breakOff('', i)
            i--
          }
        } else state.value+=code[i]
      } else if (state.type === 'container') {
        if (code[i] === "'" || code[i] === '"') {
          breakOff('', i)
          state = { type: 'string', value: '', symbol: code[i], line, layer, start: i }
        } else state.value+=code[i]
      }
    }
  }

  if (state.type === 'string') return { error: true, content: '<字串> 無法閉合', start: state.start, end: code.length-1, path: [{ file: getDirectoryPath(import.meta.url), line: state.line }] }
  else if (state.type !== undefined) breakOff('', code.length)
  
  return codeSegment
}

import getDirectoryPath from '../Tools/GetDirectoryPath.js'

import keywords from '../Keywords.json' assert { type: 'json' }

const operators = ['+', '++', '+=', '-', '--', '-=', '*', '*=', '/', '/=', '>', '>=', '<', '<=', '=', '==', '!', '或', '且', '?']