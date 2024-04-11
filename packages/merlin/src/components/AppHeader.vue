<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import HeaderLogo from '@/components/HeaderLogo.vue';

const headerLeft = ref(0);

const onScroll = () => {
  headerLeft.value = window.scrollX;
};

onMounted(() => {
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <div class="app-header">
    <div class="app-header-wrap" :style="{ right: `${headerLeft}px` }">
      <div class="header-content">
        <!-- LOGO -->
        <HeaderLogo />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-header {
  min-width: 1344px;
  color: var(--o-color-info1);
  background-color: var(--o-color-fill2);
}

.app-header-wrap {
  position: relative;
  height: 100%;
  backdrop-filter: blur(5px);
  &::before {
    top: 0;
    bottom: 0;
    right: 0;
    box-shadow: var(--o-shadow-1);
    content: '';
    left: 0;
    pointer-events: none;
    position: absolute;
  }
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--layout-header-max-width);
  margin: auto;
  padding-left: var(--layout-header-padding);
  padding-right: var(--layout-header-padding);
}

.header-logo {
  @include h1;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
