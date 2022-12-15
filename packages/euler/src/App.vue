<script setup lang="ts">
import { watch } from 'vue';
import { useCommon } from 'shared/stores/common';

const props = defineProps({
  lang: {
    type: String,
    default: 'zh',
  },
});
const store = useCommon();
watch(
  () => props.lang,
  () => store.changeLang(props.lang)
);
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
