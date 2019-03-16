import Vue from 'vue'
import App from './App'
import { setData } from '../src/utils/util';
import store from './stores';

Vue.config.productionTip = false
App.mpType = 'app';
App.store = store;

Vue.prototype.setData = setData;
Vue.prototype.$store = store;

const app = new Vue(App)
app.$mount()

wx.cloud.init({
  traceUser: true
})
