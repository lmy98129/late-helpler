import { setTimer } from '../common/polling';

export default {
  namespaced: true,
  state: {
    isStartInterval: false,
    timeout: 0,
    timeCounter: 0,
  },
  mutations: {
    start: (state, { callback, timeout }) => {
      if (!state.isStartInterval) {
        state.timeout = timeout;
        state.timeCounter = 0;
        state.isStartInterval = true;
        setTimer(callback, timeout, state)();
      }
    },

    end: (state) => {
      if (state.isStartInterval) {
        state.timeout = 0;
        state.timeCounter = 0;
        state.isStartInterval = false;
      }
    },

  },

}
