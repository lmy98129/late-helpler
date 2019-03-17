<template>
  <div></div>
</template>

<script>
export default {
  onLoad(opt) {
    let { mode, index } = opt;
    let currentRouteInfo = this.$store.state.location[`${mode}RouteInfo`];
    console.log(currentRouteInfo[index].steps);
  }
}
</script>

<style scoped>

</style>

