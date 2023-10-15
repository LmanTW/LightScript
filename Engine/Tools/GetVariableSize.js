//取得變數的大小
export default function getVariableSize (data) {
  let bytes = 0
  
  if (typeof data === 'string') bytes+=Buffer.byteLength(data, 'utf8')
  else if (typeof data === 'number') bytes+=8
  else if (typeof data === 'boolean') bytes+=4
  else if (Array.isArray(data)) data.forEach((item) => bytes+=getVariableSize(item))
  else if (typeof data === 'object') Object.keys(data).forEach((item) => bytes+=getVariableSize(item)+getVariableSize(data[item]))
  
  return bytes
}