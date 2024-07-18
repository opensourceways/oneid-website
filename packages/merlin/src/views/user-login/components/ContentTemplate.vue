<script setup lang="ts">
import LoginCard from './LoginCard.vue';
</script>
<template>
  <LoginCard>
    <div class="app-header">
      <div class="header-title">
        <slot name="headerTitle"></slot>
      </div>
    </div>
    <div class="app-body">
      <slot name="body"></slot>
    </div>
    <div class="switch">
      <slot name="switch"></slot>
    </div>
    <slot name="footer"></slot>
  </LoginCard>
</template>
<style lang="scss" scoped>

.app-header {
  display: flex;
  justify-content: center;

  .header-title {
    @include h2;
    font-weight: 600;
    color: var(--o-color-info1);
  }
}
.app-body {
  padding-top: 24px;
}
.switch {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  height: 22px;
}
</style>
