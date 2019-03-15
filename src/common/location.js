const QQMapWX = require('../utils/qqmap-wx-jssdk.min.js').default;
const iconPath = '../../static/images/location.png';
const qqmapsdk = new QQMapWX({
  key: '2GCBZ-IEWWU-7QUVD-42ZXD-D6F7V-2LFGR'
})

/**
 * 
 * @param {Object} opt - 传入的参数对象
 * @param {Object[]} opt.markers - 标记点数组
 * @param {Number} opt.markerId - 标记点数组元素的key
 * @param {Number} opt.latitude - 将要标记的点的经度
 * @param {Number} opt.longitude - 将要标记的点的纬度
 */
const markLocation = ({ markers, markerId, latitude, longitude }) => {
  markerId++;
  if (markers.length >= 2) {
    for (let i=1; i< markers.length; i++) {
      markers.splice(i, 1);
    }
  } else if (markers.length === 0) {
    markerId = 0;
  }
  markers.push({
    id: markerId, latitude, longitude, iconPath, 
  });
  return {
    markerId, markers
  }
}

/**
 * 选择一个地点，若传入opt则会帮助地图标点
 * @param {Object} opt - 地图中的标记点对象
 * @param {Object[]} opt.markers - 标记点数组
 * @param {Number} opt.markerId - 标记点数组元素的key
 */
const chooseLocation = (opt) => {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: (res) => {
        let { longitude, latitude } = res;
        if (opt === undefined) resolve({ longitude, latitude });
        else {
          let { markers, markerId } = opt;
          resolve({...markLocation({ 
            markers, markerId, latitude, longitude 
          }), longitude, latitude});
        }
      },
      fail: (error) => {
        if (!error.errMsg.indexOf('fail cancel')) {
          reject(error)
        }
      },
    })
  })
}

/**
 * 获取当前位置
 * @param {string} type - 经纬度信息格式
 * @param {Object[]} markers - 标记点数组
 * @param {Number} markerId - 标记点数组元素的key
 */
const getLocation = (type = 'gcj02', markers, markerId) => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type, success: (res) => {
        let { longitude, latitude } = res;
        if (markers === undefined || !markerId === undefined) resolve({ longitude, latitude });
        else {
          resolve({...markLocation({ 
            markers, markerId, latitude, longitude 
          }), longitude, latitude });
        }
      },
      fail: (error) => reject(error),
    })
  })
}

/**
 * 实时计算两点之间的距离，用于实时轨迹测量
 * @param {Number} lat1 - 点1的经度
 * @param {Number} lng1 - 点1的纬度
 * @param {Number} lat2 - 点2的经度
 * @param {Number} lng2 - 点2的纬度
 */
const realTimeDistance = (lat1, lng1, lat2, lng2) => {
  let dis = 0;
  let radLat1 = toRadians(lat1);
  let radLat2 = toRadians(lat2);
  let deltaLat = radLat1 - radLat2;
  let deltaLng = toRadians(lng1) - toRadians(lng2);
  dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  // 6378137为地球半径
  return dis * 6378137;
}

/**
 * 将经纬度换算成弧度制
 * @param {Number} d - 经纬度
 */
const toRadians = (d) => { return d * Math.PI / 180; }

/**
 * 计算两点间距离
 * @param {Object} opt 
 * @param {Object} [opt.from] - 默认为当前地点
 * @param {Object[]} opt.to - 需要计算的目标点，一般为1个
 * @param {Number} opt.to[].longitude - 目标点的经度
 * @param {Number} opt.to[].latitude - 目标点的纬度
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
 * @param {Object} opt - 传入参数对象
 * @param {string} opt.mode - 路径规划值
 * @param {Object[]} [polyline=[]] - 路径点数组
 * @param {Number} [distance = 0] - 距离累加，这里用于分段路径规划
 * @param {Number} [duration = 0] - 用时累加，这里用于分段路径规划
 */
const direction = (opt, polyline = [], distance = 0, duration = 0) => {
  return new Promise((resolve, reject) => {
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
          polyline.push({ points, color: '#069F51', width: 4 });
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

export {
  chooseLocation,
  getLocation,
  realTimeDistance,
  calculateDistance,
  direction,
  markLocation,
}