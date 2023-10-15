export { createInterval, deleteInterval }

import generateID from './GenerateID.js'

let timers = {}

let interval

//開始計時器
function startTimer () {
  interval = setInterval(() => {
    let time = performance.now()
    Object.keys(timers).forEach((item) => {
      if (time-timers[item].lastUpdateTime >= timers[item].interval) {
        timers[item].lastUpdateTime = time
        timers[item].callback()
      }
    })
  }, 1)
}

startTimer()

//創建間隔器
function createInterval (interval, callback) {
  let id = generateID(5, Object.keys(timers)) 

  timers[id] = { interval, callback, lastUpdateTime: performance.now() }

  if (interval === undefined) startTimer()

  return id
}

//刪除間隔器
function deleteInterval (id) {
  delete timers[id]

  if (Object.keys(timers).length < 1 && interval !== undefined) interval = clearInterval(interval)
}