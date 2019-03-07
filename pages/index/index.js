//index.js
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
const getDistance = require("../../utils/util").getDistance;
const chooseLocation = require("../../common/location").chooseLocation;

var qqmapsdk;
var timer;

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
    isStartRun: false,
    countToGetLocation: 0,
    duration: 0,
    mapHeight: 0,
  },

  onLoad() {
    let that = this;
    qqmapsdk = new QQMapWX({
      key: "2GCBZ-IEWWU-7QUVD-42ZXD-D6F7V-2LFGR"
    })
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          mapHeight: res.windowHeight * 0.65
        })
      }
    })
    this.getLocation();
  },

  getLocation() {
    let that = this;
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        let { longitude, latitude } = res;
        let { isStartRun, distance } = that.data;
        that.setData({
          longitude, latitude
        })
        if (isStartRun) {
          let { polyline } = that.data;
          let { points } = polyline[0];
          points.push({ longitude, latitude });
          that.setData({
            polyline
          })
          if (points.length > 2) {
            let lastPoint = points[points.length - 2];
            distance += getDistance(lastPoint.latitude, lastPoint.longitude, 
              latitude, longitude);
            that.setData({
              distance,
            })
          }
        }
      }, 
    })
  },
  
  chooseLocation() {
    let that = this;
    chooseLocation(this, (longitude, latitude) => {
      qqmapsdk.calculateDistance({
        to: [{
          latitude, longitude
        }],
        success: (res) => {
          let { result } = res;
          let { distance } = result.elements[0];
          that.setData({
            distance
          });
        }
      })
    })
  },

  countDown() {
    let that = this;
    let { isStartRun } = this.data;
    if (!isStartRun) return;
    timer = setInterval(() => {
      let { countToGetLocation, isStartRun } = that.data;
      if (!isStartRun) clearInterval(timer);
      countToGetLocation += 1;
      if (countToGetLocation >= 5) {
        that.getLocation();
        countToGetLocation = 0;
      }
      that.setData({
        countToGetLocation
      })
    }, 1000);
  },

  startMeasure() {
    let { markers, isStartRun } = this.data;
    if (isStartRun) {
      return;
    } else {
      isStartRun = true;
    }
    if (markers.length >= 0) {
      markers = [];
    }
    this.setData({
      markers, isStartRun, distance: 0
    })
    this.getLocation();
    this.countDown();
  },

  endMeasure() {
    let isStartRun = false;
    this.setData({ isStartRun });
  },

  direction() {
    let that = this;
    chooseLocation(this, (longitude, latitude) => {
      qqmapsdk.direction({
        mode: "walking",
        to: {
          longitude, latitude
        },
        success: (res) => {
          let { routes } = res.result;
          let polyline = [], distance = 0, duration = 0;
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
            distance = route.distance;
            duration = route.duration;
          }
          that.setData({
            polyline, distance, duration
          })
        }
      })
    })
  }
})
