import shortid from 'shortid'

export const getShortid = function () {
  let id
  do {
    id = shortid.generate()
  }
  // 不能数字开头
  while (/[1-9]/.test(id[0]) || id[0] === '-' || id[0] === '_' || id.slice(-1) === '-' || id.slice(-1) === '_')
  return id
}