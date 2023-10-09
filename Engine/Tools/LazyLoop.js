//懶惰迴圈
export default (condition, callback) => {
  return new Promise((resolve) => {
    let count = 0

    async function tick () {
      let data = (typeof condition === 'function') ? await condition(count) : condition
  
      if (typeof data === 'number') {
        if (data > count) return resolve()
      } else if (typeof data === 'boolean') {
        if (!data) return resolve()
      } else throw new Error(`未知的條件類型 ${typeof condition}`) 

      await callback(count)

      setTimeout(tick, 10)
    }
    
    tick()
  })
}

import { createInterval, deleteInterval } from './Interval.js'