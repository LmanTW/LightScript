//物件參數錯誤
export default (objectName, values, object) => {
  Object.keys(values).forEach((item) => {
    if (values[item].type !== undefined && !values[item].type.includes(typeof object[item])) throw new Error(`物件 ${objectName} 的 ${item} 只能為 ${values[item].type.map((item) => `<${item}>`).join(' 或 ')}`)
    else if (values[item].value !== undefined && !values[item].value.includes(object[item])) throw new Error(`物件 ${objectName} 的 ${item} 只能為 ${values[item].value.join(' 或 ')}`)
    else if (values[item].moreThan !== undefined && object[item] <= values[item].moreThan) throw new Error(`物件 ${objectName} 的 ${item} 必須大於 ${values[item].moreThan}`)
    else if (values[item].lessThan !== undefined && object[item] >= values[item].moreThan) throw new Error(`物件 ${objectName} 的 ${item} 必須小於 ${values[item].lessThan}`)
  })
} 