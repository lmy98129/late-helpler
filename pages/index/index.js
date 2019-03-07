//index.js
let { chooseLocation, getLocation, 
  calculateDistance, direction } = require("../../common/location");
let { toast } = require("../../common/message");
import regeneratorRuntime, { async } from "../../utils/runtime";

Page({
  data: {
    longitude: "113.324520",
    latitude: "23.099994",
    markers: [],
    polyline: [{
      points: [],
      color: '#069F51',
      width: 4
    }],
    markerId: 0,
    distance: 0,
    duration: 0,
    mapHeight: 0,
  },

  onLoad() {
    let that = this;
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          mapHeight: res.windowHeight * 0.65
        })
      }
    })
    this.getLocation();
  },

  getLocation: async function() {
    try {
      let { longitude, latitude } = await getLocation();
      this.setData({ longitude, latitude });
    } catch (error) {
      console.log(error);
      toast("获取当前位置出错");
    }

  },
  
  calculateDistance: async function() {
    try {
      this.clearMap();
      let { markers, markerId } = this.data;
      let result = await chooseLocation({ markers, markerId });
      let { longitude, latitude } = result;
      let { distance } = await calculateDistance({ 
        to: [{ longitude, latitude }] 
      });
      result = { ...result, distance };
      this.setData(result);
    } catch (error) {
      console.log(error);
      toast("距离测量出错");
    }

  },

  direction: async function() {
    try {
      this.clearMap();
      let { markers, markerId } = this.data;
      let chooseLocationRes = await chooseLocation({ markers, markerId });
      let { longitude, latitude } = chooseLocationRes;
      let directionRes = await direction({ mode: "walking",
        to: { longitude, latitude }
      });
      this.setData({ ...chooseLocationRes, ...directionRes });
    } catch (error) {
      console.log(error);
      toast("路线规划出错");
    }
  },

  multiPartDirection: async function() {
    try {
      let { markers, markerId, 
        polyline, distance, duration } = this.data;
      let chooseLocationRes = await chooseLocation({ markers, markerId });
      let { longitude, latitude } = chooseLocationRes;
      let directionRes;
      if (markers.length == 1) {
        directionRes = await direction({ mode: "walking",
          to: { longitude, latitude }
        });
      } else {
        let lastLatitude = markers[markers.length - 2].latitude;
        let lastLongitude = markers[markers.length - 2].longitude;
        directionRes = await direction({ mode: "walking",
          from: { longitude: lastLongitude, latitude: lastLatitude },
          to: { longitude, latitude }
        }, polyline, distance, duration);
      }
      this.setData({ ...chooseLocationRes, ...directionRes });
    } catch (error) {
      console.log(error);
      toast("分段规划出错");
    }
  },

  clearMap: async function() {
    try {
      let { latitude, longitude } = await getLocation();
      let initData = {
        markers: [],
        polyline: [{
          points: [],
          color: '#069F51',
          width: 4
        }], 
        distance: 0, 
        duration: 0,
        markerId: 0,
        latitude, longitude
      }
      this.setData(initData);
    } catch (error) {
      console.log(error);
      toast("重置地图出错");
    }

  }
})
