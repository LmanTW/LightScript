//輸出
export default async (content, type, location) => {
  await sendMessage({ type: 'event', name: 'log', data: { content, type, location }})
}

import sendMessage from './Message'