const QQMapWX = require("../utils/qqmap-wx-jssdk.min.js");
const iconPath = "/image/location.png";
const qqmapsdk = new QQMapWX({
  key: "2GCBZ-IEWWU-7QUVD-42ZXD-D6F7V-2LFGR"
})

/**
 * 选择一个地点，若传入opt则会帮助地图标点
 * @param {*} opt 
 */
const chooseLocation = (opt) => {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: (res) => {
        let { longitude, latitude } = res;
        if (opt === undefined) resolve({ longitude, latitude });
        else {
          let { markers, markerId } = opt;
          markers.push({
            id: markerId,
            latitude, longitude, iconPath,
          })
          markerId++;
          resolve({
            longitude, latitude, markers, markerId
          });
        }
      },
      fail: (error) => {
        if (!error.errMsg.indexOf("fail cancel")) {
          reject(error)
        }
      },
    })
  })
}

/**
 * 获取当前位置
 * @param {*} type 经纬度信息格式
 */
const getLocation = (type = "gcj02") => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type, success: (res) => resolve(res),
      fail: (error) => reject(error),
    })
  })
}

/**
 * 实时计算两点之间的距离，用于实时轨迹测量
 * @param {*} lat1 点1的经度
 * @param {*} lng1 点1的纬度
 * @param {*} lat2 点2的经度
 * @param {*} lng2 点2的纬度
 */
const realTimeDistance = (lat1, lng1, lat2, lng2) => {
  var dis = 0;
  var radLat1 = toRadians(lat1);
  var radLat2 = toRadians(lat2);
  var deltaLat = radLat1 - radLat2;
  var deltaLng = toRadians(lng1) - toRadians(lng2);
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  // 6378137为地球半径
  return dis * 6378137;
}

/**
 * 将经纬度换算成弧度制
 * @param {*} d 经纬度
 */
const toRadians = (d) => { return d * Math.PI / 180; }

/**
 * 计算两点间距离
 * @param {*} opt { from, to }
 */
const calculateDistance = (opt) => {
  return new Promise((resolve, reject) => {
    opt = { ...opt, 
      success: (res) => {
        let { result } = res;
        let { distance } = result.elements[0];
        resolve({ distance });
      },
      fail: (error) => reject(error),
    }
    qqmapsdk.calculateDistance(opt);
  })
}

/**
 * 路径规划
 * @param {*} opt 
 */
const direction = (opt, polyline = [], distance = 0, duration = 0) => {
  return new Promise((resolve, reject) => {
    console.log(opt);
    opt = { ...opt, 
      success: (res) => {
        let { routes } = res.result;
        for (let route of routes) {
          let coors = route.polyline;
          let points = [];
          for (let i = 2; i<coors.length; i++) {
            coors[i] = Number(coors[i - 2]) + Number(coors[i]) / 1000000;
          }
          for (var i=0; i<coors.length; i+=2) {
            points.push({ latitude: coors[i], longitude: coors[i + 1] })
          }
          polyline.push({ points, color: "#069F51", width: 4 });
          distance += route.distance;
          duration += route.duration;
        }
        resolve({ polyline, distance, duration });
      },
      fail: (error) => reject(error),
    }
    qqmapsdk.direction(opt);
  })
}


module.exports = {
  chooseLocation,
  getLocation,
  realTimeDistance,
  calculateDistance,
  direction,
}