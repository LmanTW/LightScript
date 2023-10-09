export { createInterval, deleteInterval }

import generateID from './GenerateID.js'

let timers = {}

setInterval(() => {
  let time = performance.now()
  Object.keys(timers).forEach((item) => {
    if (time-timers[item].lastUpdateTime >= timers[item].interval) {
      timers[item].lastUpdateTime = time
      timers[item].callback()
    }
  })
}, 1)

//創建間隔器
function createInterval (interval, callback) {
  let id = generateID(5, Object.keys(timers)) 

  timers[id] = { interval, callback, lastUpdateTime: performance.now() }

  return id
}

//刪除間隔器
function deleteInterval (id) {
  delete timers[id]
}