import complexAnalyzer from './ComplexAnalyzer.js'
import basicAnalyzer from './BasicAnalyzer.js'

//編譯
export default (code, filePath) => {
  let data = basicAnalyzer(code, filePath)
  if (data.error) return data
  data = complexAnalyzer(data.codeSegment, filePath)
  //if (data.error) return data
  return data
}