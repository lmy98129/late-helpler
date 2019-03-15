const QQMapWX = require('../utils/qqmap-wx-jssdk.min.js').default;
const qqmapsdk = new QQMapWX({
  key: '2GCBZ-IEWWU-7QUVD-42ZXD-D6F7V-2LFGR'
});

/**
 * 获取当前位置
 * @param {string} [type = 'gcj02'] - 经纬度信息格式
 */
const getCurrentLocation = (type = 'gcj02') => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type, success: (res) => {
        let { longitude, latitude } = res;
        resolve({ longitude, latitude });
      },
      fail: (error) => reject(error),
    })
  })
}

/**
 * 选择一个地点
 */
const chooseLocation = () => {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: (res) => {
        let { longitude, latitude } = res;
        resolve({ longitude, latitude });
      },
      fail: (error) => {
        // if (!error.errMsg.indexOf('fail cancel')) {
        reject(error)
        // }
      },
    })
  })
}

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
        let directDistance = distance
        resolve({ directDistance });
      },
      fail: (error) => reject(error),
    }
    qqmapsdk.calculateDistance(opt);
  })
}

/**
 * 返回当前地图中心的经纬度
 * @param {Object} map - 当前页面的MapContext实例
 */
const getCenterLocation = (map) => {
  return new Promise((resolve, reject) => {
    map.getCenterLocation({
      success: res => resolve(res),
      fail: error => reject(error),
    })
  })
}

/**
 * 路径规划
 * @param {Object} opt - 传入参数对象
 * @param {string} opt.mode - 路径规划值: 步行、骑行、坐车、公交
 */
const direction = (opt) => {
  return new Promise((resolve, reject) => {
    opt = { ...opt, 
      success: (res) => {
        let { routes } = res.result;
        let routeDistance = 0, duration = 0, polyline = [];
        for (let route of routes) {
          let coors = route.polyline;
          let points = [];
          for (let i = 2; i<coors.length; i++) {
            coors[i] = Number(coors[i - 2]) + Number(coors[i]) / 1000000;
          }
          for (var i=0; i<coors.length; i+=2) {
            points.push({ latitude: coors[i], longitude: coors[i + 1] })
          }
          polyline.push({ points, color: '#FFB700', width: 5 });
          routeDistance += route.distance;
          duration += route.duration;
        }
        resolve({ polyline, routeDistance, duration });
      },
      fail: (error) => reject(error),
    }
    qqmapsdk.direction(opt);
  })
}

export {
  getCurrentLocation,
  chooseLocation,
  calculateDistance,
  getCenterLocation,
  direction,
}