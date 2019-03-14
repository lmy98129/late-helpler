const toast = (title, icon = 'none', duration = 3000) => {
  wx.showToast({ title, icon, duration })
}

export {
  toast,
}