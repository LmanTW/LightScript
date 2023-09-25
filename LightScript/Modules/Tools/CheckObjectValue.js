//檢查物件的值
export default (objectName, conditions, object) => {
  Object.keys(conditions).forEach((item) => {
    if (conditions[item].type !== undefined && !conditions[item].type.includes((object[item] === null) ? 'undefined' :typeof object[item])) throw new Error(`物件 ${objectName} 的 ${item} 必須為一個 ${conditions[item].type.map((item2) => `<${item2}>`).join(' 或 ')}`)
    if (conditions[item].equal !== undefined && !conditions[item].equal.includes(object[item])) throw new Error(`物件 ${objectName} 的 ${item} 值只能為 ${conditions[item].equal.join(' 或 ')}`)
    if (conditions[item].moreThan !== undefined && object[item] <= conditions[item].moreThan) throw new Error(`物件 ${objectName} 的 ${item} 值必須大於 ${conditions[item].moreThan}`)
    if (conditions[item].lessThan !== undefined && object[item] >= conditions[item].lessThan) throw new Error(`物件 ${objectName} 的 ${item} 值必須大於 ${conditions[item].lessThan}`)
  })
}