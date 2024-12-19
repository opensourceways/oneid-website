<script setup lang="ts">
import { OScroller } from '@opensig/opendesign';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
</script>

<template>
  <AppHeader class="ly-header" />
  <OScroller show-type="hover">
    <main class="ly-main">
      <router-view />
    </main>
    <AppFooter class="ly-footer" />
  </OScroller>
</template>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  --layout-header-height: 64px;
  --layout-header-zIndex: 101;
  --layout-header-max-width: 100%;
  --layout-header-padding: 64px;

  --layout-content-max-width: 100%;
  --layout-content-padding: 64px;

  --layout-footer-height: 80px;

  --layout-content-min-height: calc(100vh - var(--layout-header-height) - var(--layout-footer-height));

  --o-color-link1: var(--o-color-brand1);
  --btn-color: var(--o-color-brand1);
  --btn-bd-color: var(--o-color-brand1);

  @include respond-to('<=laptop') {
    --layout-header-max-width: 100%;
    --layout-header-padding: 64px;

    --layout-content-max-width: 100%;
    --layout-content-padding: 64px;
  }

  @include respond-to('<=pad') {
    --layout-header-height: 48px;
    --layout-header-padding: 32px;

    --layout-content-padding: 32px;

    --layout-footer-height: 64px;
  }

  @include respond-to('phone') {
    --layout-header-padding: 24px;

    --layout-content-padding: 24px;

    --layout-footer-height: 108px;
    --layout-content-min-height: calc(100vh - var(--layout-header-height))
  }
}
</style>
<style lang="scss" scoped>
.ly-header {
  position: fixed;
  top: 0;
  width: 100%;
  height: var(--layout-header-height);
  z-index: var(--layout-header-zIndex);
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.05);
}

.o-scroller {
  padding-top: var(--layout-header-height);
  height: 100vh;
  background: url(./assets/login-background.png) no-repeat left;
  background-size: cover;
  --scrollbar-height: calc(100vh - var(--layout-header-height) * 2 - 10px);
  :deep(.o-scroller-container) {
    scroll-padding-top: var(--layout-header-height);
  }
}

.ly-main {
  min-height: var(--layout-content-min-height);
  :deep(.o-input-large) {
    --input-padding: 0 16px;
  }
  :deep(.o-link-primary) {
    --link-color-disabled: rgba(64, 142, 255, 0.4);
  }
}

.ly-footer {
  height: var(--layout-footer-height);
}
</style>
