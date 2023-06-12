<script setup lang="ts"></script>
<template>
  <div class="box">
    <div class="box-header">
      <slot name="header"></slot>
    </div>
    <slot name="content"></slot>
  </div>
</template>
<style lang="scss" scoped>
.box {
  height: 100%;
  background-color: var(--o-color-bg1);
  padding: 0 var(--o-spacing-h5) 40px var(--o-spacing-h5);
  color: var(--o-color-text1);
  &-header {
    font-size: var(--o-font-size-h5);
    line-height: var(--o-line-height-h5);
    font-weight: 200;
    display: flex;
    justify-content: center;
  }
  .line {
    border: 1px solid var(--o-color-division1);
    margin-top: var(--o-spacing-h4);
    margin-bottom: var(--o-spacing-h4);
  }
}
</style>
