//生成ID
export default (length, keys) => {
  let string = generateAnID(length)
  while (keys.includes(string)) string = generateAnID(length)
  return string
}

import getRandom from './GetRandom.js'

const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

//生成一串ID
function generateAnID (length) {
  let string = ''
  for (let i = 0; i < length; i++) string+=letters[getRandom(0, letters.length-1)]
  return string
}