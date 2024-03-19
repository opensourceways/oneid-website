<script setup lang="ts">
import { getOS } from 'shared/utils/utils';

const addOSTag = () => {
  const os = getOS();
  document.documentElement.dataset.system = os.toLowerCase();
};
addOSTag();
</script>

<template>
  <router-view />
</template>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--o-color-fill1);
}
</style>
