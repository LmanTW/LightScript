//創建錯誤
export default (type, content, start, end, path) => {
  return { error: true, type, content, start, end, path }
}