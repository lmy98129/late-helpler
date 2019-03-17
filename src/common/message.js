const toast = (title, icon = 'none', duration = 3000, image) => {
  let opt = { title, icon, duration };
  if (image !== undefined) opt.image = image;
  wx.showToast(opt);
}

const confirmOnly = (content) => {
  wx.showModal({
    title: '提示',
    content,
    showCancel: false,
    confirmText: '好的',
  })
}

export {
  toast,
  confirmOnly,
}