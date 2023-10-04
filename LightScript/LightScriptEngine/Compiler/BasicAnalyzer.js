//簡易類型分析器
export default async (code, mode, filePath) => {
  let state = {}
  let line = 1
  let layer = 0

  let codeSegment = []
  let i = -1

  //切斷
  function breakOff (char, back) {
    if (state.type === 'string') state.value+=char
    else  {
      if (state.type === 'container') {
        if (state.value === '是' || state.value === '否') codeSegment.push({ type: 'boolean', value: state.value, line: state.line, layer: state.layer, start: state.start, end: i-1 })
        else if (keywords.includes(state.value)) codeSegment.push({ type: 'keyword', value: state.value, line: state.line, layer: state.layer, start: state.start, end: i-1 })
        else codeSegment.push({ type: 'container', value: state.value, line: state.line, layer: state.layer, start: state.start, end: i-1 })
      } else if (state.type !== undefined) codeSegment.push({ type: state.type, value: state.value, line: state.line, layer: state.layer, start: state.start, end: i-1 })
      state = {}
    }
    if (back === true) i--
  }

  function tick () {
    i++
    if (code[i] === ' ') breakOff(' ')
    else if (code[i] === '\n') {
      if (state.type === 'note') state = {}
      else breakOff('\n', '')
    } else if (code[i] === '#') {
      breakOff('#')
      state = { type: 'note' }
    } else if (state.type === undefined) {
      if (code[i] === "'" || code[i] === '"') state = { type: 'string', value: '', symbol: code[i], line, layer, start: i }
      else if ('1234567890'.includes(code[i])) state = { type: 'number', value: code[i], line, layer, start: i }
      else if (operators.includes(code[i])) state = { type: 'operator', value: code[i], line, layer, start: i }
      else state = { type: 'container', value: code[i], line, layer, start: i }
    } else{
      if (state.type === 'string') {
        if (code[i] === state.symbol) {
          codeSegment.push({ type: 'string', value: state.value, line: state.line, layer: state.layer, start: state.start, end: i })
          state = {}
        } else state.value+=code[i]
      } else if (state.type === 'number') {
        if ('1234567890'.includes(code[i])) state.value+=code[i]
        else breakOff('', true)
      } else if (state.type === 'operator') {
        if (operators.includes(state.value+code[i])) state.value+=code[i]
        else breakOff('', true)
      } else if (state.type === 'container') {
        state.value+=code[i]
      }
    }
  }

  if (mode === 'instant') {
    while (i < code.length) tick() 
  }

  return codeSegment
}

import keywords from '../Keywords.json' assert { type: 'json' }

const operators = ['+', '-', '*', '/', '=', '++', '--', '>', '<', '>=', '<=', '或', '且']