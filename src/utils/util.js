const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 不能用箭头函数，否则this将绑定本函数所在的父上下文而不绑定Vue.prototype了
const setData = function(obj) {
  for (let key in obj) {
    this[key] = obj[key];
  }
}

export {
  formatTime,
  setData,
}
