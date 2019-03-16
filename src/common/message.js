const toast = (title, icon = 'none', duration = 3000, image) => {
  let opt = { title, icon, duration };
  if (image !== undefined) opt.image = image;
  wx.showToast(opt);
}

export {
  toast,
}