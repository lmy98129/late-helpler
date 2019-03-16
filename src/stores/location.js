import { setDistance, setDuration } from '../common/location';

export default {
  namespaced: true,
  state: {
    walkingRouteInfo: [],
    bicyclingRouteInfo: [],
    drivingRouteInfo: [],
    transitRouteInfo: [],
  },
  mutations: {
    update: (state, { mode, routeInfo }) => {
      state[`${mode}RouteInfo`] = routeInfo
    },

    clear: (state) => {
      for (let key in state) {
        if (state[key] instanceof Array) {
          state[key] = [];
        }
      }
    },

  },
}