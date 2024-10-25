<script setup lang="ts">
import LoginLanguage from 'shared/components/LoginLanguage.vue';
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
    <LoginLanguage></LoginLanguage>
  </LoginCard>
</template>
<style lang="scss" scoped>

.app-header {
  display: flex;
  justify-content: center;

  .header-title {
    font-size: var(--o-font-size-h5);
    line-height: var(--o-line-height-h5);
    color: var(--o-color-text1);
  }
}
.app-body {
  padding-top: var(--o-spacing-h4);
}
.switch {
  display: flex;
  justify-content: end;
  font-size: var(--o-font-size-text);
  line-height: var(--o-line-height-text);
}
</style>
