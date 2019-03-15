<template>
  <div >
    <div class="map-box">
      <map
        id="navi_map"
        :longitude="longitude"
        :latitude="latitude"
        :markers="markers"
        :polyline="polyline"
        enable-3D
        enable-overlooking
        enable-rotate
      >
      </map>
    </div>

  <cover-view class="pannel-wrap">
    <cover-view class="hint">距离：{{distance}}米</cover-view>
    <cover-view class="hint" v-if="duration > 0">所需时间: {{duration}}分钟</cover-view>
    <cover-view class="btn-wrap">
      <button @click="calculateDistance">距离测量</button>
    </cover-view>
    <cover-view class="btn-wrap">
      <button @click="direction">路线规划</button>
    </cover-view>
    <cover-view class="btn-wrap">
      <button @click="clearMap">重置地图</button>
    </cover-view>
  </cover-view>

  </div>
</template>

<script>
import { 
  chooseLocation, 
  getLocation, 
  calculateDistance, 
  direction,
  markLocation,
} from '../../common/location';
import { toast } from '../../common/message'

export default {
  data () {
    return {
      longitude: '113.324520',
      latitude: '',
      markers: [],
      polyline: [{
        points: [],
        color: '#069F51',
        width: 4
      }],
      markerId: 0,
      distance: 0,
      duration: 0,
      mapHeight: 0
    }
  },

  methods: {
    async getCurrentLocation() {
      try {
        let { markerId, markers } = this;
        let res = await getLocation(undefined, markers, markerId);
        this.setData(res);
      } catch (error) {
        console.log(error);
        toast('获取当前位置出错');
      }
    },

    includePath() {
      let map = wx.createMapContext('navi_map');
      let { markers } = this;
      map.includePoints({
        points: markers,
        padding: [80, 80, 80, 80],
      });
    },

    async calculateDistance() {
      try {
        let { markers, markerId } = this;
        let result = await chooseLocation({ markers, markerId });
        let { longitude, latitude } = result;
        let { distance } = await calculateDistance({ 
          to: [{ longitude, latitude }] 
        });
        delete result.longitude;
        delete result.latitude;
        let polyline = [{ 
          points: [{ latitude, longitude }, { latitude: this.latitude, longitude: this.longitude }],
          color: '#069F51', width: 4 
        }]
        console.log(result);
        this.setData({ ...result, distance, polyline });
        this.includePath();
      } catch (error) {
        console.log(error);
        toast('距离测量出错');
      }
    },

    async clearMap() {
      try {
        let initData = {
          markers: [],
          polyline: [{
            points: [],
            color: '#069F51',
            width: 4
          }], 
          distance: 0, 
          duration: 0,
        }
        this.setData(initData);
        this.getCurrentLocation();
      } catch (error) {
        console.log(error);
        toast('重置地图出错');
      }
    },

    async direction() {
      try {
        let { markers, markerId } = this;
        let chooseLocationRes = await chooseLocation({ markers, markerId });
        let { longitude, latitude } = chooseLocationRes;
        delete chooseLocationRes.longitude;
        delete chooseLocationRes.latitude;
        let directionRes = await direction({ mode: 'walking',
          to: { longitude, latitude }
        });
        this.setData({ ...chooseLocationRes, ...directionRes });
        this.includePath();
      } catch (error) {
        console.log(error);
        toast('路线规划出错');
      }
    },
  },

  created () {
    let that = this;
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          mapHeight: res.windowHeight * 0.65
        })
      }
    })
    this.getCurrentLocation();
  }
}
</script>

<style scoped>
.map-box {
  position:absolute;
  top: 0;
  bottom: 230px;
  left: 0px;
  right: 0px;
}

#navi_map{
  width: 100%;
  height: 100%;
}

.btn-wrap {
  margin-top: 30rpx;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
}

.btn-wrap:last-child {
  margin-bottom: 50rpx;
}

.hint {
  margin-top: 40rpx;
  margin-left: 30rpx;
  font-size: 32rpx;
}

.pannel-wrap {
  position: fixed;
  bottom: -40rpx;
  width: 100%;
  border-radius: 40rpx;
  padding-bottom: 40rpx;
  background: #fff;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  /* box-shadow: 0 -10rpx 50rpx 5rpx #ccc; */
  border-top: 3rpx solid #ccc;
}
</style>
