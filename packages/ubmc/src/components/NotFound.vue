<script setup lang="ts">
import { shallowRef, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'shared/i18n';
import { OButton } from '@opensig/opendesign';
import { useCommon, useCommonData } from 'shared/stores/common';
import { getUserAuth, logout } from 'shared/utils/login';
import notFoundImgLight from '@/assets/404.png';
import notFoundImgDark from '@/assets/404.png';

const router = useRouter();
const { lang, loginParams } = useCommonData();
const commonStore = useCommon();
const i18n = useI18n();

const tips = {
  'LOGIN': {
    'tip': i18n.value.LOGIN_REDIRECT_URI_ERROR,
    'btnName': i18n.value.LOGIN_AGAIN,
    'func': () => {
      router.push({
        path: '/login',
        query: { redirect_uri: loginParams.value.redirect_uri || import.meta.env.VITE_OPENEULER_WEBSITE },
      });
    }
  },
  'LOGOUT': {
    'tip': i18n.value.LOGOUT_REDIRECT_URI_ERROR,
    'btnName': i18n.value.LOGOUT,
    'func': () => {
      const redirectUri = loginParams.value.redirect_uri || import.meta.env.VITE_OPENEULER_WEBSITE ;
      const { token } = getUserAuth();
      if (token) {
        logout(
          { },
          redirectUri
        );
      } else {
        location.href = redirectUri;
      }
    }
  }
};

const pageFrom = sessionStorage.getItem('pageFrom');
const content = shallowRef();
if (pageFrom === 'logout') {
  content.value = tips['LOGOUT'];
} else {
  content.value = tips['LOGIN'];
}

const notFoundImg = computed(() => {
  return commonStore.theme === 'light' ? notFoundImgLight : notFoundImgDark;
});
</script>

<template>
  <div class="nofound">
    <img class="nofound-img" :src="notFoundImg" alt="404" />
    <p class="nofound-text">
      <slot name="title">
        {{ content.tip }}
      </slot>
    </p>
    <OButton
      color="primary"
      variant="outline"
      size="large"
      class="nofound-btn"
      @click="content.func">
      <slot name="btn">
        {{ content.btnName }}
      </slot>
    </OButton>
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
  height: var(--layout-content-min-height);
  .nofound-text {
    margin-top: var(--o-spacing-h5);
    font-size: var(--o-font-size-h7);
    opacity: 0.8;
  }
  .nofound-img {
    height: 300px;
  }
  .nofound-btn {
    margin-top: var(--o-spacing-h5);
    font-size: var(--o-font-size-h7);
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
    .nofound-btn {
      margin-top: var(--o-spacing-h5);
      font-size: var(--o-font-size-tip);
      line-height: var(--o-line_height-tip2);
    }
  }
}
</style>
