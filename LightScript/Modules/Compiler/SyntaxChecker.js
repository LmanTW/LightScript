export { checkRelevance, checkKeywordSyntax }

import createError from '../Tools/CreateError.js'

import typesName from '../TypesName.json' assert { type: 'json' }
import syntax from './Syntax.json' assert { type: 'json' }

//檢查關聯性
function checkRelevance (codeSegment, filePath) {
  let errors = []

  for (let i = 0; i < codeSegment.length-1; i++) {
    if (syntax.relevance[codeSegment[i].type] !== undefined && !syntax.relevance[codeSegment[i].type].includes(codeSegment[i+1].type)) errors.push(createError('compiler', `多出了一個 <${typesName[codeSegment[i+1].type]}>`, codeSegment[i+1].start, codeSegment[i+1].end, [{ file: filePath, line: codeSegment[i+1].line }]))
  }

  if (errors.length > 0) return { error: true, errors }
  else return { error: false, codeSegment }
}

//檢查關鍵字的語法
function checkKeywordSyntax (codeSegment, filePath) {
  let errors = []

  for (let i = 0; i < codeSegment.length; i++) {
    if (codeSegment[i].type === 'keyword' || syntax.keywordSyntax[codeSegment[i].value] !== undefined) {
      let state = false
      
      for (let i2 = 0; i2 < syntax.keywordSyntax[codeSegment[i].value].length; i2++) {
        let state2 = true

        for (let i3 = 0; i3 < syntax.keywordSyntax[codeSegment[i].value][i2].length; i3++) {
          if (syntax.keywordSyntax[codeSegment[i].value][i2][i3].includes(':')) state2 = codeSegment[i+i3+1].type === syntax.keywordSyntax[codeSegment[i].value][i2][i3].split(':')[0] && codeSegment[i+i3+1].value === syntax.keywordSyntax[codeSegment[i].value].split(':')[1]
          else if (syntax.keywordSyntax[codeSegment[i].value][i2][i3].includes('<') && syntax.keywordSyntax[codeSegment[i].value][i2][i3].includes('>')) state2 = codeSegment[i+i3+1].type === syntax.keywordSyntax[codeSegment[i].value][i2][i3].substring(1, syntax.keywordSyntax[codeSegment[i].value][i2][i3].length-1)
          
          if (state2 === false) break
        }

        if (state2) {
          state = true
          break
        }
      }

      if (!state) {
        let correctSyntaxes = syntax.keywordSyntax[codeSegment[i].value].map((item) => item.map((item2) => {
          console.log(item2)
        }))
        //errors.push()
      }
    }
  }

  if (errors.length > 0) return { error: true, errors }
  else return { error: false, codeSegment }
}