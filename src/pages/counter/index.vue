<template>
  <div class="counter-warp">
    <p>Vuex counter：{{ count }}</p>
    <p>
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
    </p>
    <p>
      <button @click="startInterval">start interval</button>
      <button @click="setNewInterval">set new interval</button>
      <button @click="endInterval">end interval</button>
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState('counter', [
      'count',
    ])
  },
  methods: {
    increment () {
      this.$store.commit('counter/increment');
    },
    decrement () {
      this.$store.commit('counter/decrement');
    },
    startInterval() {
      let timeout = 1000;
      const foo = (msg) => () => console.log(msg);
      this.$store.commit('polling/start', { timeout, callback: foo('Hello, blean!') });
    },
    endInterval() {
      this.$store.commit('polling/end');
    },
    setNewInterval() {
      this.$store.commit('polling/end');
      let timeout = 1000;
      let that = this;
      const foo = (that) => () => that.increment();
      this.$store.commit('polling/start', { timeout, callback: foo(this) });
    }
  },
}
</script>

<style>
.counter-warp {
  text-align: center;
  margin-top: 100px;
}
.home {
  display: inline-block;
  margin: 100px auto;
  padding: 5px 10px;
  color: blue;
  border: 1px solid blue;
}
</style>
