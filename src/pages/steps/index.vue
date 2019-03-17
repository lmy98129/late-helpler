<template>
  <div class="steps-wrap">
    <div class="steps-item" v-for="(item, index) in steps" :key="index">
      {{ item.instruction }}
    </div>
    <div class="hint">
      <text>
        以上结果由腾讯地图提供，仅供参考\n
        如需实时路线导航，请使用专业的地图APP
      </text>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      mode: '',
      index: 0,
    }
  },
  computed: {
    ...mapState('location', {
      steps(state) {
        let { mode, index } = this;
        if (mode.length && mode.length > 0) {
          return this.$store.state.location[`${mode}RouteInfo`][index].steps;
        }
      }
    })
  },
  onLoad(opt) {
    let { mode, index } = opt;
    this.setData({ mode, index });
  }
}
</script>

<style scoped>

.steps-item {
  margin: 0 30rpx;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #c3c3c3;
  font-size: 30rpx;
}

.hint {
  margin-bottom: 40rpx;
}

</style>

