<template>
  <div >
    <div class="map-box" :style="{bottom: pannelHeight + 'px'}">
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
        <cover-view class="re-locate-btn-wrap-outer">
          <cover-view v-if="!isDestinationSelected" class="re-locate-btn-wrap">
            <cover-view class="re-locate-btn" @click="startNavigation">开始导航</cover-view>
          </cover-view>
          <cover-view v-else class="re-locate-btn-wrap">
            <cover-view class="re-locate-btn" @click="stopNavigation">重新设定</cover-view>
            <cover-view class="re-locate-btn" @click="refresh">更新定位</cover-view>
          </cover-view>
        </cover-view>
      </map>
    </div>

    <div class="pannel-wrap" :style="{height: pannelHeight + 'px'}">
      <div class="top-tab">
        <div :class="{'top-tab-item': true, 'selected': topTab === 0}" @click="changeTopTab" data-index=0>步行</div>
        <div :class="{'top-tab-item': true, 'selected': topTab === 1}" @click="changeTopTab" data-index=1>骑行</div>
        <div :class="{'top-tab-item': true, 'selected': topTab === 2}" @click="changeTopTab" data-index=2>驾车</div>
        <div :class="{'top-tab-item': true, 'selected': topTab === 3}" @click="changeTopTab" data-index=3>公交</div>
      </div>

      <div v-if="!isDestinationSelected" class="choose-dest-btn-wrap">
        <button @click="chooseDeparture" class="choose-dest-btn">设置出发地</button>
        <button @click="chooseDestination" class="choose-dest-btn">设置目的地</button>
      </div>
      <div v-else class="choose-dest-btn-wrap navigating">
        <div class="hint">直线距离：{{directDistance}}米</div>
        <div class="hint">路程距离：{{routeDistance}}米</div>
        <div class="hint" v-if="duration > 0">所需时间: {{duration}}分钟</div>
      </div>
    </div>

  </div>
</template>

<script>
import {
  getCurrentLocation,
  chooseLocation,
  calculateDistance, 
  getCenterLocation,
  direction,
} from '../../common/location';
import { toast } from '../../common/message';

const currentIconPath = '/static/images/current-location.png';
const iconPath = '/static/images/location.png'

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
      markerId: 1,
      directDistance: 0,
      routeDistance: 0,
      duration: 0,
      pannelHeight: 0,
      topTab: 0,
      isDestinationSelected: false,
    }
  },

  methods: {
    changeTopTab(e) {
      let { topTab } = this;
      let { index } = e.target.dataset;
      index = parseInt(index);
      if (index !== topTab) {
        topTab = index;
        this.setData({ topTab });
      }
    },

    async getCurrentLocation() {
      try {
        let { markers } = this;
        let { longitude, latitude } = await getCurrentLocation();
        let marker = {
          id: 0, latitude, longitude, iconPath: currentIconPath, 
        }
        this.setMarker(marker, longitude, latitude);
      } catch (error) {
        if (error.errMsg.indexOf('getLocation:fail')) {
          this.getCurrentLocation();
        } else {
          console.log(error);
          toast('获取当前位置出错, 请点击“设置出发地”重试');
        }
      }
    },

    async chooseDeparture() {
      try {
        wx.showActionSheet({
          itemList: ['使用当前位置', '选择其他位置'],
          success: async res => {
            let longitude, latitude, id;
            switch (res.tapIndex) {
              case 0:
                let getCurrentRes = await getCurrentLocation();
                longitude = getCurrentRes.longitude;
                latitude = getCurrentRes.latitude;
                break;
              case 1:
                let getChooseRes = await chooseLocation();
                longitude = getChooseRes.longitude;
                latitude = getChooseRes.latitude;
                break;
            }
            let marker = {
              id: 0, latitude, longitude, iconPath: currentIconPath,
            };
            this.setMarker(marker, longitude, latitude);
          }
        })
      } catch (error) {
        if (error.errMsg === undefined) {
          console.log(error);
          toast('设置出发地点出错, 请重试');
        }
      }
    },

    async chooseDestination() {
      try {
        let chooseLocationRes = await chooseLocation();
        let { longitude, latitude } = chooseLocationRes;
        let { markerId, markers } = this;
        let marker = {
          id: markerId, latitude, longitude, iconPath,
        }
        this.setMarker(marker, longitude, latitude);
        this.includePoints();
      } catch (error) {
        if (error.errMsg === undefined) {
          console.log(error);
          toast('设置目的地出错，请重试');
        }
      }
    },

    setMarker(marker, longitude, latitude) {
      let { markers } = this;
      let index = markers.findIndex(x => x.id === marker.id);
      if (index >= 0) {
        markers[index] = marker
      } else {
        switch (marker.id) {
          case 0:
            markers.splice(0, 0, marker);
            break;
          case 1:
            markers.push(marker);
            break;
        }
      }
      if (markers.length > 1) {
        this.includePoints();
      } else {
        this.setData({ longitude, latitude });
      }
    },

    includePoints() {
      let map = wx.createMapContext('navi_map');
      let { markers } = this;
      map.includePoints({
        points: markers,
        padding: [80, 80, 80, 80],
      });
    },

    async startNavigation() {
      try {
        let { markers } = this;
        if (markers.length < 2) {
          throw new Error('请设置好出发地和目的地后再开始导航');
        }
        wx.showLoading({
          title: '导航数据加载中'
        })
        let index = markers.findIndex(x => x.id === 0);
        if (index < 0) {
          throw new Error('出发地不存在，请设置出发地');
        }
        let departPoint = markers[index];

        index = markers.findIndex(x => x.id !== 0);
        if (index < 0) {
          throw new Error('目的地不存在，请设置目的地');
        }
        let destPoint = markers[index];

        let { directDistance } = await calculateDistance({ 
          from: departPoint,
          to: [destPoint],
        });

        let directionRes = await direction({ mode: 'walking',
          from: departPoint,
          to: destPoint,
        });

        this.setData({ isDestinationSelected: true, directDistance, ...directionRes });
        wx.hideLoading();
      } catch (error) {
        wx.hideLoading();
        console.log(error);
        toast(error.message);
      }
    },

    stopNavigation() {
      this.setData({ 
        isDestinationSelected: false,
        polyline: [],
      });
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
          directDistance: 0, 
          routeDistance: 0,
          duration: 0,
          longitude: '113.324520',
          latitude: '',
        }
        this.setData(initData);
        this.getCurrentLocation();
      } catch (error) {
        console.log(error);
        toast('重置地图出错');
      }
    },
  },

  created () {
    let that = this;
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          pannelHeight: res.windowHeight * 0.30,
        })
      }
    })
    this.getCurrentLocation();
  },

  async onShow() {
    try {
      if (this.markers.length >= 2) {
        console.log('includePoints executed');
        this.includePoints();
        let map = wx.createMapContext('navi_map');
        let { longitude, latitude } = await getCenterLocation(map);
        this.setData({ longitude, latitude });
      }
    } catch (error) {
      console.log(error);
      toast('地图自动位移失败');
    }
  }
}
</script>

<style scoped>
.map-box {
  position:absolute;
  top: 0;
  left: 0px;
  right: 0px;
}

#navi_map{
  width: 100%;
  height: 100%;
}

.re-locate-btn-wrap {
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.re-locate-btn-wrap-outer {
  position: absolute;
  bottom: 40rpx;
  width: 100%;
}

.re-locate-btn {
  width: 250rpx;
  background: rgb(24, 25, 32);
  color: #fff;
  text-align: center;
  padding-top: 20rpx;
  padding-bottom: 20rpx;
  border-radius: 50rpx;
  display: inline-block;
  font-size: 40rpx;
  font-weight: bold;
  margin-left: auto;
  margin-right: auto;
}

.choose-dest-btn-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  width: 90%;
  margin: 0 auto;
}

.choose-dest-btn-wrap.navigating {
  align-items: initial;
}

.choose-dest-btn {
  width: 300rpx;
  border-radius: 50rpx;
  font-size: 38rpx;
  background: rgb(255, 209, 97);
  font-weight: bolder;
}

.btn-group-wrap {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.btn-wrap {
  height: 100%;
  vertical-align: middle;
}

.hint {
  margin-top: 40rpx;
  margin-left: auto;
  margin-right: auto;
  width: 90%;
  font-size: 32rpx;
}

.pannel-wrap {
  position: fixed;
  width: 100%;
  background: #fff;
  left: 0;
  right: 0;
  bottom: 0;
  margin-left: auto;
  margin-right: auto;
  border-top: 3rpx solid #ddd;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top-tab {
  display: flex;
  width: 68%;
  margin-top: 35rpx;
  flex-direction: row;
  justify-content: space-around;
  margin-left: auto;
  margin-right: auto;
  align-items: flex-end;
  margin-bottom: 20rpx;
}

.top-tab .top-tab-item {
  font-size: 35rpx;
  color: #aaa;
  padding-top: 30rpx;
}

.top-tab .top-tab-item.selected {
  color: #111;
  font-size: 44rpx;
  font-weight: bold;
  padding-top: 0;
  position: relative;
  bottom: -10rpx;
}

.top-tab .top-tab-item.selected:after {
  content: "";
  display: block;
  position: relative;
  bottom: 15rpx;
  left: 0;
  right: 0;
  height: 15rpx;
  width: 80%;
  background-color: rgb(255, 209, 97);
  margin: 0 auto;
  z-index: -1;
}

</style>
