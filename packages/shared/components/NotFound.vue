<script setup lang="ts">
import { useCommon, useCommonData } from '../stores/common';

import notFoundImgLight from '../assets/404.png';
import notFoundImgDark from '../assets/404_dark.png';
import notFoundImgLigitGauss from '../assets/gauss-404.png';
import notFoundImgDarkGauss from '../assets/gauss-404-dark.png';
import { computed } from 'vue';
const { lang } = useCommonData();
const commonStore = useCommon();

const notFoundImg = computed(() => {
  if (import.meta.env?.VITE_COMMUNITY === 'opengauss') {
    return commonStore.theme === 'light'
      ? notFoundImgLigitGauss
      : notFoundImgDarkGauss;
  }
  return commonStore.theme === 'light' ? notFoundImgLight : notFoundImgDark;
});
</script>

<template>
  <div class="nofound">
    <img class="nofound-img" :src="notFoundImg" alt="404" />
    <p class="nofound-text">
      <slot name="title">
        {{
          lang === 'zh'
            ? '回调地址redirect_uri不匹配'
            : 'The callback address redirect_uri does not match'
        }}
      </slot>
    </p>
  </div>
</template>

<style lang="scss" scoped>
.nofound {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: var(--o-font-size-h6);
  color: var(--o-color-text1);
  height: 100vh;
  .nofound-text {
    margin-top: var(--o-spacing-h5);
    font-size: var(--o-font-size-h7);
  }
  .nofound-img {
    height: 300px;
  }
  @media screen and (max-width: 768px) {
    font-size: var(--o-font-size-text);
    .nofound-img {
      max-height: 232px;
    }
    .nofound-text {
      margin-top: var(--o-spacing-h6);
      font-size: var(--o-font-size-tip);
    }
  }
}
</style>
