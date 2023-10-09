export { checkRelevance, checkKeywordSyntax }

import typesName from '../../TypesName.json' assert { type: 'json' }
import syntax from '../../Syntax.json' assert { type: 'json' }

//檢查關聯性
function checkRelevance (codeSegment, filePath, detillPath) {
  let errors = []

  for (let i = 0; i < codeSegment.length-1; i++) {
    if (syntax.relevance[codeSegment[i].type] !== undefined && !syntax.relevance[codeSegment[i].type].includes(codeSegment[i+1].type)) errors.push({ content: `多出了一個 <${typesName[codeSegment[i+1].type]}> '${codeSegment[i+1].value}'`, location: [{ file: filePath, detillPath, line: codeSegment[i+1].line, start: codeSegment[i+1].start, end: codeSegment[i+1].end }]})
  }

  return { error: errors.length > 0, errors }
}

//檢查關鍵字的語法
function checkKeywordSyntax (codeSegment, filePath, detillPath) {
  let errors = []

  for (let i = 0; i < codeSegment.length; i++) {
    if (codeSegment[i].type === 'keyword' && syntax.keywordSyntax[codeSegment[i].value] !== undefined) {
      let state = false
      let skip = 0
      
      for (let i2 = 0; i2 < syntax.keywordSyntax[codeSegment[i].value].length; i2++) {
        let state2 = true

        for (let i3 = 0; i3 < syntax.keywordSyntax[codeSegment[i].value][i2].length; i3++) {
          if (syntax.keywordSyntax[codeSegment[i].value][i2][i3].includes(':')) state2 = codeSegment[i+i3+1].type === syntax.keywordSyntax[codeSegment[i].value][i2][i3].split(':')[0] && codeSegment[i+i3+1].value === syntax.keywordSyntax[codeSegment[i].value].split(':')[1]
          else {
            if (syntax.keywordSyntax[codeSegment[i].value][i2][i3].includes('<') && syntax.keywordSyntax[codeSegment[i].value][i2][i3].includes('>')) state2 = codeSegment[i+i3+1] !== undefined
            if (syntax.keywordSyntax[codeSegment[i].value][i2][i3].includes('<') && syntax.keywordSyntax[codeSegment[i].value][i2][i3].includes('>')) state2 = codeSegment[i+i3+1].type === syntax.keywordSyntax[codeSegment[i].value][i2][i3].substring(1, syntax.keywordSyntax[codeSegment[i].value][i2][i3].length-1)
          }
          if (state2 === false) break
        }

        if (state2) {
          state = true
          skip = syntax.keywordSyntax[codeSegment[i].value][i2].length
          break
        }
      }

      if (!state) {
        let correctSyntaxes = syntax.keywordSyntax[codeSegment[i].value].map((item) => item.map((item2) => {
          if (item2.includes(':')) return item.split(':')[1]
          else if (item2[0] === '<' && item2[item2.length-1] === '>') return `<${typesName[item2.substring(1, item2.length-1)]}>`
        }).join(' ')).join(' 或 ')

        errors.push({ content: `<關鍵字> ${codeSegment[i].value} 的後面只能為 ${correctSyntaxes}`, location: [{ file: filePath, detillPath, line: codeSegment[i].line, start: codeSegment[i].start, end: codeSegment[i].end }]})
      }

      i+=skip
    }
  }

  return { error: errors.length > 0, errors }
}