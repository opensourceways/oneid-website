<script setup lang="ts">
import { useCommon } from 'shared/stores/common';
const { saveLoginParams } = useCommon();
// 设置全局的默认client_id
saveLoginParams({ client_id: '90aa315f895544359209920da32ff75a' });
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
