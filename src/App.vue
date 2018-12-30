<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }

</script>

<style lang="less">
  @import '~vux/src/styles/reset.less';

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .7s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

</style>
