import { parentPort } from 'worker_threads'

//向主線程發送訊息
export default async (content) => {
  return new Promise((resolve) => {
    let id = generateID(5, Object.keys(messages))
    messages[id] = (data) => resolve(data)
    parentPort.postMessage(Object.assign(content, { messageID: id }))
  })
}

import generateID from '../Tools/GenerateID'

let messages = {}