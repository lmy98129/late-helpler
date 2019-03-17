<template>
  <div >
    <div class="map-box" :style="{bottom: pannelHeight + 'px'}" v-show="isTimerSetModalHidden">
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
        <cover-view class="cover-btn-wrap-outer">
          <cover-view v-if="!isNavigationStarted" class="cover-btn-wrap">
            <cover-view class="cover-btn" @click="startNavigation">计时 | 导航</cover-view>
          </cover-view>
          <cover-view v-else class="cover-btn-wrap">
            <cover-view class="cover-btn circle-btn" @click="prevFunction">
              <cover-image class="back-icon" src="/static/images/back.png"></cover-image>
            </cover-view>
            <cover-view class="cover-btn short-btn timer-btn" @click="showTimerSetModal">迟到计时</cover-view>
            <cover-view class="cover-btn short-btn" @click="routeStep">路线导航</cover-view>
            <cover-view class="cover-btn circle-btn" @click="reLocate">
              <cover-image  class="re-locate-icon" src="/static/images/re-locate.png"></cover-image>
            </cover-view>
          </cover-view>
        </cover-view>
      </map>
    </div>

    <div class="pannel-wrap" :style="{height: pannelHeight + 'px'}">
      <div class="top-tab" v-if="!isTimerStarted">
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
      <div v-else-if="isNavigationStarted && !isTimerStarted" class="pannel-main-wrap navigating">
        <swiper v-if="currentRouteInfo !== undefined && currentRouteInfo.length > 0"
          class="pannel-main-swiper"
          :style="{ height: pannelHeight-60 + 'px' }" 
          :indicator-dots="currentRouteInfo.length > 2"
          @change="swiperChange"
          :current="routerCurrent"
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
        <div v-else class="hint-outer-wrap empty-info">
          <div class="hint-wrap">
            <div class="hint-title">直线距离</div>
            <div class="hint-content">
              <div class="number">{{setDirectDistance}}</div>
              <div class="unit">{{directDistUnit}}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="isTimerStarted" class="pannel-main-wrap navigating">
        <swiper
          class="pannel-main-swiper"
          :style="{ height: pannelHeight + 'px' }" 
          :indicator-dots="!isLate"
          :current="timerCurrent"
          >
          <swiper-item v-if="!isLate">
            <scroll-view class="scroll-view" scroll-y='true' style="height: 94%;">
              <div class="middle-wrap timer" v-if="!isLate">
                <div class="hint-wrap">
                  <div class="hint-title">剩余时间</div>
                  <div class="hint-content">
                    <div class="time-wrap" v-if="counter.day > 0" >
                      <div class="number">{{counter.day}}</div>
                      <div class="unit">天</div>
                    </div>
                    <div class="time-wrap" v-if="counter.hr > 0" >
                      <div class="number">{{counter.hr}}</div>
                      <div class="unit">小时</div>
                    </div>
                    <div class="time-wrap">
                      <div class="number">{{counter.min}}</div>
                      <div class="unit">分钟</div>
                    </div>
                    <div class="time-wrap">
                      <div class="number">{{counter.sec}}</div>
                      <div class="unit">秒</div>
                    </div>
                  </div>
                </div>
              </div>
            </scroll-view>
          </swiper-item>
          <swiper-item>
            <scroll-view class="scroll-view" scroll-y='true' style="height: 94%;">
              <div class="middle-wrap timer">
                <div class="hint-wrap" v-if="currentRouteInfo[currentIndex].duration > 0">
                  <div class="hint-title">所需时间</div>
                  <div class="hint-content">
                    <div class="number" v-if="currentRouteInfo[currentIndex].durationHours > 0">
                      {{currentRouteInfo[currentIndex].durationHours}}
                    </div>
                    <div class="unit" v-if="currentRouteInfo[currentIndex].durationHours > 0">
                      小时
                    </div>
                    <div class="number">{{currentRouteInfo[currentIndex].durationMin}}</div>
                    <div class="unit">{{currentRouteInfo[currentIndex].durationMinUnit}}</div>
                  </div>
                </div>
                <div class="hint-wrap">
                  <div class="hint-title">迟到状态</div>
                  <div class="hint-content pure-text">
                    {{isLate ? '已迟到' : '未迟到'}}
                  </div>
                </div>
                <div class="hint">
                  <text>
                    以上结果仅供参考，判定迟到的标准：\n
                    当前位置到目标地点所需时间 >= 剩余时间
                  </text>
                </div>
              </div>
            </scroll-view>
          </swiper-item>
        </swiper>
      </div>
    </div>

    <custom-modal 
      :hidden="isTimerSetModalHidden" 
      @cancel="hideTimerSetModal"
      @confirm="setTimer"
      title='设置到达时间'
      >
      <div class="choose-dest-wrap inside-modal">
        <div class="choose-dest inside-modal">
          <image class="dest-icon" src="/static/images/date.png" />
          <picker 
            class="dest-name" 
            mode="date" 
            @change="setDateArrival"
            :start="nowDate"
            >
            {{ dateArrival }}
          </picker>
        </div>
        <div class="choose-dest inside-modal">
          <image class="dest-icon" src="/static/images/timer.png" />
          <picker 
            class="dest-name" 
            mode="time" 
            @change="setTimeArrival"
            :value="nowTime"
            >
            {{ timeArrival }}
          </picker>
        </div>
      </div>
    </custom-modal>
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
import { toast, confirmOnly } from '../../common/message';
import { mapState } from 'vuex';
import customModal from '../../components/custom-modal';
import { diffTime, formatTime } from '../../utils/util';

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
      isTimerStarted: false,
      isTimerSetModalHidden: true,
      departPointName: '',
      destPointName: '',
      directDistUnit: '',
      routerCurrent: 0,
      timerCurrent: 0,
      currentIndex: 0,
      currentTimeArrival: '',
      currentDateArrival: '',
      counter: {},
      nowDate: '',
      nowTime: '',
      isLate: false,
    }
  },

  components: { 'custom-modal': customModal },

  computed: {
    setDepartPointName() {
      return this.departPointName.length === undefined ? '输入起点' 
        : (this.departPointName.length <= 0 ? '输入起点' : this.departPointName);
    },
    setDestPointName() {
      return this.destPointName.length === undefined ? '输入终点' 
        : (this.destPointName.length <= 0 ? '输入终点' : this.destPointName);
    },
    timeArrival() {
      return this.currentTimeArrival === undefined ? '输入预计到达时间'
        : (this.currentTimeArrival.length <= 0 ? '输入预计到达时间' : this.currentTimeArrival);
    },
    dateArrival() {
      return this.currentDateArrival = undefined ? '输入预计到达日期'
        : (this.currentDateArrival.length <= 0 ? '输入预计到达日期' : this.currentDateArrival)
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
          this.setData({ routerCurrent: -1 });
          this.setData({ routerCurrent: 0, currentIndex: 0 });
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
      this.setData({ currentIndex: current });
    },

    switchLocation() {
      let { markers, departPointName, destPointName } = this;
      let res = switchLocation(markers, departPointName, destPointName);
      this.setData(res);
    },

    async getCurrentLocation() {
      try {
        this.chooseLocation('depart', 0);
      } catch (error) {
        if (error.errMsg.indexOf('getLocation:fail')) {
          this.chooseLocation('depart', 0);
        } else {
          console.log(error);
          toast('获取当前位置出错, 请点击“输入起点”重试');
        }
      }
    },

    async chooseLocationActionSheet(type='depart') {
      let hintStr;
      switch (type) {
        case 'depart':
          hintStr = '作为起点';
          break;
        case 'dest':
          hintStr = '作为终点';
          break;
      }
      wx.showActionSheet({
        itemList: [`使用当前位置${hintStr}`, `选择其他位置${hintStr}`],
        success: async res => {
          this.chooseLocation(type, res.tapIndex);
        }
      })
    },

    async chooseLocation(type='depart', chooseMode=0) {
      try {
        let longitude, latitude, id, name, iconPath;
        switch (chooseMode) {
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
        });
      } catch (error) {
        if (error.errMsg === undefined) {
          console.log(error);
          toast('设置地点出错, 请重试');
        }
      }
    },

    chooseDestination() {
      this.chooseLocationActionSheet('dest');
    },

    chooseDeparture() {
      this.chooseLocationActionSheet('depart');
    },

    async reLocate() {
      await this.chooseLocation('depart', 0);
      await this.startNavigation();
      await this.setTimer();
      await this.resetTimerCurrent();
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

    prevFunction() {
      let { isTimerStarted, isNavigationStarted } = this;
      if (isTimerStarted) {
        this.setData({
          isTimerStarted: false,
          counter: {}
        });
      } else if (isNavigationStarted) {
        this.setData({ 
          isNavigationStarted: false,
        });
        this.$store.commit('location/clear');
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

    showTimerSetModal() {
      let now = new Date();
      this.setData({ isTimerSetModalHidden: false, ...formatTime(now) });
    },

    hideTimerSetModal() {
      this.setData({ 
        isTimerSetModalHidden: true,
      });
    },

    setTimer() {
      try {
        let { currentTimeArrival, currentDateArrival } = this;
        if (currentTimeArrival === undefined || 
          currentTimeArrival.length <= 0 || 
          currentDateArrival === undefined || 
          currentDateArrival === undefined) {
          confirmOnly(`请您填写完整的日期和时间。
            如果您是今天内到达，请填写今天的日期，感谢您的配合`);
          return;
        }
        this.setData({
          isTimerStarted: true,
          isTimerSetModalHidden: true,
        });
        this.resetTimerCurrent();
        this.countDown();
      } catch (error) {
        console.log(error);
        toast('计时器出错，请重试');
        this.setData({ 
          isTimerStarted: false,
          isTimerSetModalHidden: true,
        })
      }
    },

    resetTimerCurrent() {
      this.setData({
        timerCurrent: -1,
      });
      this.setData({
        timerCurrent: 0,
      })
    },

    modalTouchMove(e) {
      console.log(e);
    },

    setDateArrival(e) {
      let { value } = e.target;
      this.setData({
        currentDateArrival: value,
      })
    },

    setTimeArrival(e) {
      let { value } = e.target;
      this.setData({
        currentTimeArrival: value,
      })
    },

    countDown() {
      try {
        let { currentTimeArrival, 
          currentDateArrival, isTimerStarted, topTab, currentIndex } = this;
        let end = new Date(`${currentDateArrival} ${currentTimeArrival}`);
        let { mode, counter, totalMinutes } = diffTime(end);
        let routeMode = modes[topTab];
        let currentRouteInfo = this.$store.state.location[`${routeMode}RouteInfo`];
        if (currentRouteInfo && currentRouteInfo[currentIndex] &&
          currentRouteInfo[currentIndex].duration && 
          currentRouteInfo[currentIndex].duration <= totalMinutes && 
          isTimerStarted && mode === 'timing') {
          this.setData({ counter, isLate: false });
          setTimeout(this.countDown, 1000);
        } else {
          this.setData({ isLate: true });
        }
      } catch (error) {
        console.log(error);
        toast('计时器错误，请重试');
      }
    },

    routeStep() {
      let { topTab, currentIndex } = this;
      let routeMode = modes[topTab];
      let url = `../steps/main?mode=${routeMode}&index=${currentIndex}`;
      wx.navigateTo({ url });
    }
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
  },

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

.cover-btn-wrap {
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.cover-btn-wrap-outer {
  position: absolute;
  bottom: 40rpx;
  width: 100%;
}

.cover-btn {
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
  height: 45rpx;
}

.cover-btn.short-btn {
  width: 220rpx;
}

.cover-btn.short-btn.timer-btn {
  background: #FBCC00;
  color: #222;
  border: 4rpx solid #222;
  padding-bottom: 17rpx;
}

.cover-btn.circle-btn {
  background: #fff;
  width: 90rpx;
  height: 50rpx;
  color: #222;
  border: solid .5rpx #aaa;
}

.back-icon {
  height: 50rpx;
  width: 50rpx;
  margin: 0 auto;
  margin-top: -3rpx;
}

.re-locate-icon {
  height: 57rpx;
  width: 57rpx;
  margin: 0 auto;
  margin-top: -2rpx;
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

.hint-content.pure-text {
  font-size: 76rpx;
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

.choose-dest-wrap.inside-modal {
  margin-bottom: 55rpx;
}

.choose-dest.inside-modal {
  margin: 20rpx auto;
  z-index: 2000;
  width: 80%;
  align-items: flex-end;
  width: 78%;
}

.inside-modal .dest-icon {
  margin-left: 0;
  margin-right: 0;
  width: 68rpx;
  height: 68rpx;
}

.inside-modal .dest-name {
  margin-left: 20rpx;
  padding-left: 5rpx;
  font-size: 39rpx;
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

.middle-wrap.timer {
  justify-content: space-around;
  margin-left: 0;
  flex-wrap: wrap;
  margin-top: 25rpx;
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

.timer-wrap {
  display: flex;
  flex-direction: row;
  margin: 20rpx auto;
  justify-content: space-around;
  flex-wrap: wrap;
}

.time-wrap {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  margin: auto 10rpx;
}

.time-wrap .number {
  font-family: 'Oswald';
  font-size: 95rpx;
}

.time-wrap .unit {
  margin-bottom: 20rpx;
  font-size: 25rpx;
}
</style>
