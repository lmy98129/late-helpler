<template>
  <div class="mask" v-if="!hidden">
    <div class="modal-title">{{title}}</div>
    <div class="modal-content" :style="{height: height ? '80%' : height}">
      <scroll-view scroll-y class="main-content">
        <slot></slot>
      </scroll-view>
      <div class="modal-btn-wrapper">
        <div class="cancel-btn" style="color:#777" @click="cancel">取消</div>
        <div class="confirm-btn" style="color:#FF8F00" @click="confirm">确定</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['hidden', 'height', 'title'],

  methods: {
    cancel() {
      this.$emit('cancel');
    },
    confirm() {
      this.$emit('confirm');
    },
  }

}
</script>

<style>
.mask{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.4);
  z-index: 9999;
  flex-direction: column;
}

.modal-title {
  width: 83%;
  text-align: center;
  background: #fff;
  border-top-left-radius: 20rpx;
  padding-top: 40rpx;
  padding-bottom: 40rpx;
  border-top-right-radius: 20rpx;
  font-size: 40rpx;
  font-weight: bold;
  color: #353535;
}

.modal-content{
  display: flex;
  flex-direction: column;
  width: 83%;
  /* height: 80%; */
  background-color: #fff;
  border-bottom-left-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
}

.modal-btn-wrapper{
  display: flex;
  flex-direction: row;
  height: 95rpx;
  border-top: 2rpx solid rgba(7,17,27,0.1);
}

.cancel-btn, .confirm-btn{
  flex: 1;
  height: 95rpx;
  line-height: 95rpx;
  text-align: center;
  font-size: 38rpx;
  font-weight: bold;
}

.cancel-btn{
  border-right: 2rpx solid rgba(7,17,27,0.1);
}

.main-content{
  flex: 1;
  height: 100%;
  overflow-y: hidden; 
}
</style>

