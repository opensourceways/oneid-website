<script setup lang="ts">
import { useCommon } from 'shared/stores/common';
const { saveLoginParams } = useCommon();
// 设置全局的默认client_id
saveLoginParams({ client_id: '62f463c917a9cd81591e0be1' });
</script>
<template>
  <router-view />
</template>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--o-color-bg1);
}
</style>
