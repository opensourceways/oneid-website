<script lang="ts" setup>
import {
  threePartsLoginSuccess,
  USERCENTER_PAGE,
} from '../utils/login-provider';
import IconLoading from '~icons/app/icon-loading.svg';
import {
  getParamsFromUrl,
  getSessionStorage,
  removeSessionStorage,
} from '../utils/utils';
import { userLink } from '../api/api-center';
import { useRouter } from 'vue-router';
import { testIsPhone } from '../utils/helper';
import { onMounted } from 'vue';

const router = useRouter();

onMounted(() => {
  init();
});

const init = () => {
  const str = getSessionStorage(USERCENTER_PAGE) || '';
  if (str) {
    // bind
    threePartsBindSuccess();
  } else {
    // login
    threePartsLoginSuccess();
  }
};

const threePartsBindSuccess = () => {
  const urlParams = getParamsFromUrl();
  const str = getSessionStorage(USERCENTER_PAGE) || '';
  const lang = str.split('_')[0] || 'zh';
  const params = {
    code: urlParams?.code,
    community: import.meta.env?.VITE_COMMUNITY,
  };
  userLink(params).finally(() => {
    let uri = '';
    if (testIsPhone()) {
      removeSessionStorage(USERCENTER_PAGE);
      uri = `/${lang}/mobile/profile/binding`;
    } else {
      uri = `/${lang}/profile`;
    }
    router.push(uri);
  });
};
</script>

<template>
  <div class="loading">
    <OIcon class="loading-icon"><IconLoading></IconLoading></OIcon>
  </div>
</template>

<style lang="scss" scoped>
.loading {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--o-color-brand1);
  font-size: var(--o-font-size-h2);
  .loading-icon {
    animation: rotate 2s infinite linear;
  }
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
