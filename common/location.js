const iconPath = "../../image/location.png";

const chooseLocation = (that, callback) => {
  wx.chooseLocation({
    success: (res) => {
      let { longitude, latitude } = res;
      let { markers, markerId } = that.data;
      markers.pop();
      markers.push({
        id: markerId,
        latitude, longitude, iconPath,
      })
      markerId++;
      that.setData({
        longitude, latitude, markers, markerId
      });
      if (callback !== undefined) {
        callback(longitude, latitude);
      }
    }
  })
}

module.exports = {
  chooseLocation,
}