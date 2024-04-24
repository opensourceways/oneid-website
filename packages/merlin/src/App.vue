<script setup lang="ts">
import { getOS } from 'shared/utils/utils';
import { OScroller } from '@opensig/opendesign';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';

const addOSTag = () => {
  const os = getOS();
  document.documentElement.dataset.system = os.toLowerCase();
};
addOSTag();
</script>

<template>
  <AppHeader class="ly-header"/>
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
  min-width: 1200px;

  --layout-header-height: 64px;
  --layout-header-zIndex: 101;
  --layout-header-max-width: 1344px;
  --layout-header-padding: 12px;

  --layout-content-max-width: 1344px;
  --layout-content-padding: 12px;

  --layout-footer-height: 80px;

  --layout-content-min-height: calc(100vh - var(--layout-header-height) - var(--layout-footer-height));

  @include respond-to('<=laptop') {
    --layout-header-max-width: 100%;
    --layout-header-padding: 5%;

    --layout-content-max-width: 100%;
    --layout-content-padding: 5%;
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

    --layout-footer-height: 48px;
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
}

.o-scroller {
  padding-top: var(--layout-header-height);
  height: 100vh;
  --scrollbar-height: calc(100vh - var(--layout-header-height) * 2 - 10px);
  :deep(.o-scroller-container) {
    scroll-padding-top: var(--layout-header-height);
  }
}

.ly-main {
  min-height: var(--layout-content-min-height);
  background-color: var(--o-color-fill1);
}

.ly-footer {
  height: var(--layout-footer-height);
  background-color: var(--o-color-fill1);
}
</style>
