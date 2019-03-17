const decomposeTime = (microSec) => {
  // 总秒数
  let second = Math.floor(microSec / 1000);
  // 天数
  let day = Math.floor(second/3600/24);
  // 小时
  let hr = Math.floor(second/3600%24);
  // 分钟
  let min = Math.floor(second/60%60);
  // 秒
  let sec = Math.floor(second%60);
  
  return { day, hr, min, sec };
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return { 
    nowDate: [year, month, day].map(formatNumber).join('-'), 
    nowTime: [hour, minute, second].map(formatNumber).join(':')
  };
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

const diffTime = (end) => {
  let endTime = end.getTime();
  let startTime = new Date().getTime();
  let totalMicroSec = endTime - startTime;
  let totalMinutes = parseInt(totalMicroSec / 60000);
  if (totalMicroSec < 0) return { mode: 'timed-out', counter: {}, totalMinutes};
  else {
    return { mode: 'timing', counter: decomposeTime(totalMicroSec), totalMinutes};
  }
}

export {
  formatTime,
  setData,
  diffTime,
  decomposeTime,
  formatNumber,
}
