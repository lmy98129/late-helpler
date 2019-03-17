<template>
  <div class="main-wrap">
    <div class="steps-wrap" v-if="mode !== 'transit'">
      <div class="steps-item" v-for="(item, index) in steps" :key="index">
        {{ item.instruction }}
      </div>
    </div>
    <div v-else>
      <div v-for="(item, index) in steps" :key="index">
        <div v-if="item.steps !== undefined">
          <div v-for="(subItem, subIndex) in item.steps" :key="subIndex" class="steps-item">
            {{ subItem.instruction }}
          </div>
        </div>
        <div v-if="item.lines !== undefined">
          <div v-for="(line, subIndex) in item.lines" :key="subIndex" class="steps-item">
            {{ line.vehicle }} {{line.title}} {{ (line.geton !== undefined && line.geton.title !== undefined) ? line.geton.title : '' }} {{ (line.geton !== undefined || line.getoff !== undefined ) ? '-' : '' }} {{ (line.getoff !== undefined && line.getoff.title !== undefined) ? line.getoff.title : '' }} {{ subIndex === 0 ? '' : '起终点同上' }}
          </div>
        </div>
      </div>
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
import { mapState } from 'vuex';
import { typeTrans } from '../../common/location';

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
        try {
          let { mode, index } = this;
          if (mode.length && mode.length > 0) {
            let steps = this.$store.state.location[`${mode}RouteInfo`][index].steps;
            if (mode === 'transit') {
              for (let index = 0; index < steps.length; index++) {
                if (steps[index].lines) {
                  for (let subIndex = 0; subIndex < steps[index].lines.length; subIndex++) {
                    let vehicle = steps[index].lines[subIndex].vehicle;
                    steps[index].lines[subIndex].vehicle = typeTrans(vehicle);
                  }
                }
              }
            }
            return steps;
          } else return [];
        } catch (error) {
          console.log(error);
          return [];
        }
      }
    }),
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

