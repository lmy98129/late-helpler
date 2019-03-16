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
          <cover-view v-if="!isNavigationStarted" class="re-locate-btn-wrap">
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

      <div v-if="!isNavigationStarted" class="pannel-main-wrap">
        <div class="middle-wrap">
          <div class="switch-btn" @click="switchLocation">
            <div class="iconfont icon-jiaohuan"></div>
          </div>
          <div class="choose-dest-wrap">
            <div class="choose-dest" @click="chooseDeparture">
              <image class="dept-icon" src="/static/images/current-location.png" />
              <div class="dest-name adjust">{{ setDepartPointName }}</div>
            </div>
            <div class="choose-dest" @click="chooseDestination">
              <image class="dest-icon" src="/static/images/location.png" />
              <div class="dest-name">{{ setDestPointName }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="pannel-main-wrap navigating">
        <swiper 
          class="pannel-main-swiper"
          :style="{ height: pannelHeight-60 + 'px' }" 
          :indicator-dots="currentRouteInfo.length > 2"
          @change="swiperChange"
          :current="current"
          v-if="currentRouteInfo !== undefined && currentRouteInfo.length > 0"
          >
          <swiper-item v-for="(route, index) in currentRouteInfo" :key="index">
            <scroll-view class="scroll-view" scroll-y='true' style="height: 94%;">
              <div class="inner-scroll-view">
                <div class="hint-outer-wrap">
                  <div class="hint-wrap">
                    <div class="hint-title">直线距离</div>
                    <div class="hint-content">
                      <div class="number">{{setDirectDistance}}</div>
                      <div class="unit">{{directDistUnit}}</div>
                    </div>
                  </div>
                  <div class="hint-wrap">
                    <div class="hint-title">路程距离</div>
                    <div class="hint-content">
                      <div class="number">{{route.routeDistance}}</div>
                      <div class="unit">{{route.routeDistUnit}}</div>
                    </div>
                  </div>
                  <div class="hint-wrap" v-if="route.duration > 0">
                    <div class="hint-title">所需时间</div>
                    <div class="hint-content">
                      <div class="number" v-if="route.durationHours > 0">{{route.durationHours}}</div>
                      <div class="unit" v-if="route.durationHours > 0">小时</div>
                      <div class="number">{{route.durationMin}}</div>
                      <div class="unit">{{route.durationMinUnit}}</div>
                    </div>
                  </div>
                </div>
                <div class="hint">以上结果由腾讯地图提供，仅供参考</div>
              </div>
            </scroll-view>
          </swiper-item>
        </swiper>
        <div class="hint-outer-wrap empty-info" v-else>
          <div class="hint-wrap">
            <div class="hint-title">直线距离</div>
            <div class="hint-content">
              <div class="number">{{setDirectDistance}}</div>
              <div class="unit">{{directDistUnit}}</div>
            </div>
          </div>
        </div>
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
  reverseGeocoder,
  switchLocation,
  setDistance,
  setDuration,
} from '../../common/location';
import { toast } from '../../common/message';
import { mapState } from 'vuex';

const departIconPath = '/static/images/current-location.png';
const destIconPath = '/static/images/location.png';
const errorIconPath = '/static/images/error.png';
const modes = ['walking', 'bicycling', 'driving', 'transit'];

export default {
  data () {
    return {
      longitude: '113.324520',
      latitude: '',
      markers: [],
      polyline: [],
      markerId: 1,
      directDistance: 0,
      pannelHeight: 0,
      topTab: 0,
      isNavigationStarted: false,
      departPointName: '',
      destPointName: '',
      directDistUnit: '',
      current: 0,
    }
  },

  computed: {
    setDepartPointName() {
      return this.departPointName.length === undefined ? '输入起点' 
        : (this.departPointName.length <= 0 ? '输入起点' : this.departPointName);
    },
    setDestPointName() {
      return this.destPointName.length === undefined ? '输入终点' 
        : (this.destPointName.length <= 0 ? '输入终点' : this.destPointName);
    },
    setDirectDistance() {
      let { directDistance } = this;
      let { distUnit, distance } = setDistance(directDistance);
      this.setData({ directDistUnit: distUnit });
      return distance;
    },
    ...mapState('location', {
      currentRouteInfo(state) {
        let { topTab } = this;
        let mode = modes[topTab];
        let currentRouteInfo = state[`${mode}RouteInfo`];
        if (currentRouteInfo[0] && currentRouteInfo[0].polyline) {
          this.setData({ polyline: currentRouteInfo[0].polyline });
        } else {
          this.setData({ polyline: [] });
        }
        return currentRouteInfo;
      }
    })
  },

  methods: {
    changeTopTab(e) {
      let { topTab, isNavigationStarted } = this;
      let { index } = e.target.dataset;
      index = parseInt(index);
      if (index !== topTab) {
        topTab = index;
        this.setData({ topTab });
        if (isNavigationStarted) {
          this.startNavigation();
          this.setData({ current: -1 });
          this.setData({ current: 0 });
        }
      }
    },

    swiperChange(e) {
      let { current } = e.target;
      let { topTab } = this;
      let mode = modes[topTab];
      let currentRouteInfo = this.$store.state.location[`${mode}RouteInfo`];
      if (currentRouteInfo[current] && currentRouteInfo[current].polyline) {
        this.setData({ polyline: currentRouteInfo[current].polyline });
      }
    },

    switchLocation() {
      let { markers, departPointName, destPointName } = this;
      let res = switchLocation(markers, departPointName, destPointName);
      this.setData(res);
    },

    async getCurrentLocation() {
      try {
        let { markers } = this;
        let { longitude, latitude, name } = await getCurrentLocation();
        let marker = {
          id: 0, latitude, longitude, iconPath: departIconPath, 
        }
        this.setMarker(marker, longitude, latitude);
        this.setData({ 
          departPointName: name,
        })
      } catch (error) {
        if (error.errMsg.indexOf('getLocation:fail')) {
          this.getCurrentLocation();
        } else {
          console.log(error);
          toast('获取当前位置出错, 请点击“输入起点”重试');
        }
      }
    },

    async chooseLocation(type='depart') {
      try {
        wx.showActionSheet({
          itemList: ['使用当前位置', '选择其他位置'],
          success: async res => {
            let longitude, latitude, id, name, iconPath;
            switch (res.tapIndex) {
              case 0:
                let getCurrentRes = await getCurrentLocation();
                longitude = getCurrentRes.longitude;
                latitude = getCurrentRes.latitude;
                name = getCurrentRes.name;
                break;
              case 1:
                let getChooseRes = await chooseLocation();
                longitude = getChooseRes.longitude;
                latitude = getChooseRes.latitude;
                name = getChooseRes.name;
                break;
            }
            switch (type) {
              case 'depart':
                iconPath = departIconPath;
                id = 0;
                break;
              case 'dest':
                iconPath = destIconPath;
                id = 1;
                break;
            }
            let { markers } = this;
            let index = markers.findIndex(x => {
              return id === 0 ? (x.id === 1) : (x.id === 0);
            });
            if (index >= 0) {
              if (markers[index].longitude === longitude && markers[index].latitude === latitude) {
                toast('起点终点相同', undefined, undefined, errorIconPath);
                return;
              }
            }
            let marker = { id, latitude, longitude, iconPath, };
            this.setMarker(marker, longitude, latitude);
            this.setData({
              [`${type}PointName`]: name,
            })
          }
        })
      } catch (error) {
        if (error.errMsg === undefined) {
          console.log(error);
          toast('设置地点出错, 请重试');
        }
      }
    },

    chooseDestination() {
      this.chooseLocation('dest');
    },

    chooseDeparture() {
      this.chooseLocation('depart');
    },

    setMarker(marker, longitude, latitude) {
      let { markers } = this;
      let index = markers.findIndex(x => x.id === marker.id);
      if (index >= 0) {
        markers[index] = marker;
      } else {
        markers.push(marker);
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
        let { markers, topTab } = this;
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

        let mode = modes[topTab];

        let { routeInfo } = await direction({ mode,
          from: departPoint,
          to: destPoint,
        });

        setTimeout(() => {
          if (routeInfo === undefined) {
            throw new Error('加载超时');
          }
        }, 10000)

        this.$store.commit('location/update', { mode, routeInfo });

        this.setData({ isNavigationStarted: true, directDistance });
        wx.hideLoading();
      } catch (error) {
        wx.hideLoading();
        console.log(error);
        if (error.message.indexOf('起终点距离超长') >= 0) {
          this.setData({ polyline: [] });
          toast(`${error.message}，请更换出行方式`);
        } else {
          toast(error.message);
        }
      }
    },

    stopNavigation() {
      this.setData({ 
        isNavigationStarted: false,
      });
      this.$store.commit('location/clear');
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
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          pannelHeight: res.windowHeight * 0.32,
        })
      }
    })
    this.getCurrentLocation();
  },

  async onShow() {
    try {
      if (this.markers.length >= 2) {
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

.pannel-main-wrap {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 93%;
  margin: 0 auto;
  align-items: center
}

.pannel-main-wrap.navigating {
  justify-content: space-around;
}

.scroll-vew {
  width: 100%;
}

.inner-scroll-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-top: 15rpx;
}

.hint-outer-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
}

.hint-outer-wrap.empty-info {
  margin-top: -30rpx;
}

.hint-wrap {
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
  margin-right: 20rpx;
  margin-top: 10rpx;
}

.hint-title {
  font-size: 32rpx;
  text-align: center;
}

.hint-content {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

.hint-content .number {
  font-family: 'Oswald';
  font-size: 90rpx;
}

.hint-content .unit {
  margin-bottom: 20rpx;
  font-size: 30rpx;
}

.hint {
  font-size: 21rpx;
  text-align: center;
  margin-top: 20rpx;
  width: 100%;
  margin-bottom: 20rpx;
}

.dept-icon {
  width: 40rpx;
  height: 60rpx;
}

.dest-icon {
  width: 70rpx;
  height: 69rpx;
  margin-left: -14rpx;
  margin-right: -14rpx;
}

.dest-name {
  font-size: 40rpx;
  margin-left: 10rpx;
  padding-left: 20rpx;
  border-bottom: 3rpx solid #999;
  font-weight: bold;
  color: #333;
  max-width: 75%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.dest-name.adjust {
  margin-left: 14rpx;
  padding-left: 17rpx;
}

.choose-dest-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-right: 15rpx;
  justify-content: space-between;
  height: 70%;
}

.choose-dest {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10rpx;
  padding-top: 10rpx;
  padding-bottom: 10rpx;
}

.middle-wrap {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  align-items: center;
  margin-top: -20rpx;
}

.choose-dest-btn {
  width: 300rpx;
  border-radius: 50rpx;
  font-size: 38rpx;
  background: rgb(255, 209, 97);
  font-weight: bolder;
}

.switch-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 20rpx;
  padding-right: 30rpx;
  height: 100%;
}

.switch-btn .iconfont {
  font-size: 42rpx;
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
  margin-bottom: 35rpx;
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

.pannel-main-swiper {
  width: 100%;
}
</style>
