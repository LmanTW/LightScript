import basicAnalyzer from './BasicAnalyzer.js'

//編譯
export default (code) => {
  let codeSegment = basicAnalyzer(code)
  if (!Array.isArray(codeSegment)) return codeSegment
}