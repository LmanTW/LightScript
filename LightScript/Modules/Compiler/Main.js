import complexAnalyzer from './ComplexAnalyzer.js'
import basicAnalyzer from './BasicAnalyzer.js'

//編譯
export default (code, filePath) => {
  let errors = []

  let data = basicAnalyzer(code, filePath)
  if (data.error) errors = errors.concat(data.errors)
  data = complexAnalyzer(data.codeSegment, 'chunk', filePath)
  if (data.error) errors = errors.concat(data.errors)

  return { error: errors.length > 0, errors: errors, codeSegment: data.codeSegment }
}