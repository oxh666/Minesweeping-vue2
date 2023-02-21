<template>
<div class="layout">
  <div class="layout-item"></div>
</div>
</template>

<script lang="ts">
export default {
  name: 'LayoutPage'
}
</script>

<style scoped lang="less">
.layout{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .layout-item{
    width: 50%;
    height: 50%;
    background: #fff;
  }
}
</style>
