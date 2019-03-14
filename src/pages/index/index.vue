<template>
  <div >
    <map 
      :style="{width: '100%', height: mapHeight + 'px'}"
      :longitude="longitude"
      :latitude="latitude"
      :markers="markers"
      :polyline="polyline"
      show-location
      enable-3D
      enable-overlooking
      enable-rotate
    >
    </map>

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
        let { longitude, latitude } = await getLocation();
        this.setData({ longitude, latitude });
      } catch (error) {
        console.log(error);
        toast('获取当前位置出错');
      }
    },

    async calculateDistance() {
      try {
        this.clearMap();
        let { markers, markerId } = this;
        let result = await chooseLocation({ markers, markerId });
        let { longitude, latitude } = result;
        let { distance } = await calculateDistance({ 
          to: [{ longitude, latitude }] 
        });
        this.setData({ ...result, distance })
      } catch (error) {
        console.log(error);
        toast('距离测量出错');
      }
    },

    async clearMap() {
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
        toast('重置地图出错');
      }
    },

    async direction() {
      try {
        this.clearMap();
        let { markers, markerId } = this;
        let chooseLocationRes = await chooseLocation({ markers, markerId });
        let { longitude, latitude } = chooseLocationRes;
        let directionRes = await direction({ mode: 'walking',
          to: { longitude, latitude }
        });
        this.setData({ ...chooseLocationRes, ...directionRes });
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
  bottom: 30rpx;
  width: 92%;
  border-radius: 30rpx;
  background: #fff;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  padding-left: 10rpx;
  padding-right: 10rpx;
}
</style>
