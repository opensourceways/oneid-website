<script setup lang="ts"></script>
<template>
  <div class="box">
    <div class="box-header">
      <slot name="header"></slot>
    </div>
    <div class="line"></div>
    <slot name="content"></slot>
  </div>
</template>
<style lang="scss" scoped>
.box {
  height: 100%;
  background-color: var(--o-color-bg2);
  padding: var(--o-spacing-h2);
  color: var(--o-color-text1);
  &-header {
    font-size: var(--o-font-size-h3);
    line-height: var(--o-line-height-h3);
    font-weight: 500;
  }
  .line {
    border: 1px solid var(--o-color-division1);
    margin-top: var(--o-spacing-h4);
    margin-bottom: var(--o-spacing-h4);
  }
}
</style>
