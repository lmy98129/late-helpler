import Vuex from 'vuex'
import Vue from 'vue'
import counter from './counter';
import location from './location';
import polling from './polling';
import logger from './plugins/logger';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    counter,
    location,
    polling,
  },
  plugins: [logger],
})