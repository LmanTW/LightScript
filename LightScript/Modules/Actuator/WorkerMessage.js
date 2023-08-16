import { parentPort } from 'worker_threads'

parentPort.on('message', (msg) => {
  if (msg.type === 'return' && messages[msg.messageID] !== undefined) {
    messages[msg.messageID](msg)
    delete messages[msg.messageID]
  }
})

//向主線程發送訊息
export default async (content) => {
  return new Promise((resolve) => {
    let id = generateID(5, Object.keys(messages))
    messages[id] = (data) => resolve(data)
    parentPort.postMessage(Object.assign(content, { messageID: id }))
  })
}

import generateID from '../Tools/GenerateID.js'

let messages = {}