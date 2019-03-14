import Vue from 'vue'
import App from './App'
import { setData } from '../src/utils/util';

Vue.config.productionTip = false
App.mpType = 'app'
Vue.prototype.setData = setData;

const app = new Vue(App)
app.$mount()

wx.cloud.init({
  traceUser: true
})
