const QQMapWX = require('../utils/qqmap-wx-jssdk.min.js').default;
const qqmapsdk = new QQMapWX({
  key: '2GCBZ-IEWWU-7QUVD-42ZXD-D6F7V-2LFGR'
});
const departIconPath = '/static/images/current-location.png';
const destIconPath = '/static/images/location.png';

/**
 * 获取当前位置
 * @param {string} [type = 'gcj02'] - 经纬度信息格式
 */
const getCurrentLocation = (type = 'gcj02') => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type, success: async (res) => {
        try {
          let { longitude, latitude } = res;
          let { name } = await reverseGeocoder({ location: { longitude, latitude } });
          resolve({ longitude, latitude, name });
        } catch (error) {
          reject(error);
        }
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
        let { longitude, latitude, name } = res;
        resolve({ longitude, latitude, name });
      },
      fail: (error) => {
        reject(error)
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
      success: res => {
        let { result } = res;
        let { distance } = result.elements[0];
        let directDistance = distance
        resolve({ directDistance });
      },
      fail: error => reject(error),
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
 * 解压缩路径数组
 * @param {Number[]} coors - 经过前向差分压缩的坐标数组
 */
const convertCoors = (coors) => {
  let points = []
  for (let i = 2; i<coors.length; i++) {
    coors[i] = Number(coors[i - 2]) + Number(coors[i]) / 1000000;
  }
  for (var i=0; i<coors.length; i+=2) {
    points.push({ latitude: coors[i], longitude: coors[i + 1] })
  }
  return points;
}

/**
 * 路径规划
 * @param {Object} opt - 传入参数对象
 * @param {string} opt.mode - 路径规划值: 步行“walking”、骑行“bicycling”、坐车“driving”、公交“transit”
 */
const direction = (opt) => {
  return new Promise((resolve, reject) => {
    opt = { ...opt, 
      success: res => {
        try {
          let { routes } = res.result;
          let routeInfo = [];
          switch (opt.mode) {
            case 'walking':
            case 'bicycling':
            case 'driving':
              for (let route of routes) {
                let coors = route.polyline;
                let points = convertCoors(coors);
                let polyline = [{ points, color: '#FFB700', width: 7, arrowLine: true }];
  
                let routeDistance = route.distance;
                let { duration, steps } = route;
  
                let setDurationRes = setDuration(duration);
                let { distance, distUnit } = setDistance(routeDistance); 
  
                routeInfo.push({ 
                  polyline, duration, steps, 
                  routeDistance: distance, routeDistUnit: distUnit,
                  ...setDurationRes,
                });
              }
              break;
            case 'transit':
              for (let route of routes) {
                let { steps, duration } = route;
                let routeDistance = route.distance;
                let polyline = [];
                for (let step of steps) {
                  let { mode } = step;
                  if (mode === 'WALKING') {
                    let coors = step.polyline;
                    if (coors !== undefined && coors instanceof Array) {
                      let points = convertCoors(coors);
                      polyline.push({ points, color: '#1E90FF', width: 5, dottedLine: true });
                    }
                  } else if (mode === 'TRANSIT') {
                    let coors = step.lines[0].polyline;
                    if (coors !== undefined && coors instanceof Array) {
                      let points = convertCoors(coors);
                      polyline.push({ points, color: '#FFB700', width: 7, arrowLine: true });
                    }
                  }
                }
  
                let setDurationRes = setDuration(duration);
                let { distance, distUnit } = setDistance(routeDistance); 
  
                routeInfo.push({
                  polyline, duration, steps,
                  routeDistance: distance, routeDistUnit: distUnit,
                  ...setDurationRes,
                });
              }
              break;
          }
          resolve({ routeInfo });
        } catch (error) {
          console.log(error);
          reject(error);
        }
      },
      fail: error => reject(error),
    }
    qqmapsdk.direction(opt);
  })
}

/**
 * 传入地点坐标，返回地点信息
 * @param {Object} opt - 传入参数对象
 * @param {Object} opt.location - 地点对象
 * @param {Number} opt.location.latitude - 地点纬度
 * @param {Number} opt.location.longitude - 地点经度
 */
const reverseGeocoder = (opt) => {
  return new Promise((resolve, reject) => {
    opt = {...opt, 
      success: res => {
        let { formatted_addresses: { recommend }, address } = res.result;
        let name = recommend.length <= address.length ? recommend : address;
        resolve({ name });
      },
      fail: error => reject(error),
    }
    qqmapsdk.reverseGeocoder(opt);
  })
}

/**
 * 交换起点和终点
 * @param {Object[]} markers - 起终点构成的标志点数组，一般长度为2
 * @param {string} departPointName - 起点的地点名称
 * @param {string} destPointName - 终点的地点名称
 */
const switchLocation = (markers, departPointName, destPointName) => {
  let departIndex = markers.findIndex(x => x.id === 0);
  let destIndex = markers.findIndex(x => x.id === 1);
  if (departIndex >= 0 && destIndex >= 0) {
    markers[departIndex].id = 1;
    markers[destIndex].id = 0;

    markers[departIndex].iconPath = destIconPath;
    markers[destIndex].iconPath = departIconPath;
  } else if (departIndex >= 0 || destIndex >= 0) {
    if (departIndex >= 0) {
      markers[departIndex].iconPath = destIconPath;
      markers[departIndex].id = 1;
    } else if (destIndex >= 0) {
      markers[destIndex].iconPath = departIconPath;
      markers[destIndex].id = 0;
    }
  }
  let tmp = departPointName;
  departPointName = destPointName;
  destPointName = tmp;
  return { departPointName, destPointName };
}

/**
 * 将距离由米换算成公里
 * @param {Number} distance - 距离，单位为米
 */
const setDistance = (distance) => {
  if (isNaN(distance) || distance <= 0) {
    return { distance: 0, distUnit: '' };
  } else if (distance > 1000) {
    let kMeter = distance / 1000;
    return { distance: Math.round(kMeter*10) / 10, distUnit: '公里' };
  } else {
    return { distance, distUnit: '米' };
  }
}

/**
 * 将时间由“分钟”换算为“小时-分钟”
 * @param {Number} duration 经过的时间，单位为分钟
 */
const setDuration = (duration) => {
  if (isNaN(duration) || duration <= 0) {
    return { durationHours: 0, durationMinUnit: '', durationMin: 0 };
  } else if (duration > 60) {
    let durationHours = Math.ceil(duration / 60);
    let durationMin = duration % 60;
    return { durationHours, durationMinUnit: '分钟', durationMin };
  } else {
    return { durationHours: 0, durationMinUnit: '分钟', durationMin: duration };
  }
}

export {
  getCurrentLocation,
  chooseLocation,
  calculateDistance,
  getCenterLocation,
  direction,
  reverseGeocoder,
  switchLocation,
  setDistance,
  setDuration,
}