<script setup lang="ts">
import { OLink, useMessage } from '@opensig/opendesign';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { accountRegisterPost } from 'shared/api/api-login';
import { getRsaEncryptWord } from 'shared/utils/rsa';
import { useI18n } from 'shared/i18n';
import { useCommonData, useCookieStore } from 'shared/stores/common';
import { getPrivacyVersion } from 'shared/utils/utils';
import { oa, enableOA } from 'shared/utils/analytics';
import LoginTemplate from './components/LoginTemplate.vue';

const COOKIE_AGREED_STATUS = {
  NOT_SIGNED: '0', // 未签署
  ALL_AGREED: '1', // 同意所有cookie
  NECCESSARY_AGREED: '2', // 仅同意必要cookie
};

const loginTemplate = ref<any>(null);
const router = useRouter();
const route = useRoute();
const i18n = useI18n();
const message = useMessage();
const cookieStore = useCookieStore();

// 分析埋点，含有指定URL参数的注册请求调用回调埋点接口，登录时去除
const SOURCE_FLAG = 'utm_source';

const goLogin = () => {
  const query = { ...route.query };
  if (query[SOURCE_FLAG]) {
    delete query[SOURCE_FLAG];
  }
  router.push({
    path: '/login',
    query: query,
  });
};
const { loginParams } = useCommonData();
const register = async (form: any) => {
  const oneidPrivacyAccepted = await getPrivacyVersion();
  const param: any = {
    username: form.username,
    account: form.account,
    code: form.code,
    client_id: loginParams.value.client_id,
    oneidPrivacyAccepted,
    community: import.meta.env?.VITE_COMMUNITY,
  };
  if (form.password) {
    const password = await getRsaEncryptWord(form.password);
    param.password = password;
  }
  accountRegisterPost(param).then(() => {
    cookieStore.status = COOKIE_AGREED_STATUS.ALL_AGREED;
    message.success({
      content: i18n.value.REGISTER_SUCCESS,
    });
    goLogin();
    // 分析埋点
    if (route.query?.[SOURCE_FLAG]) {
      enableOA();
      oa.report('utm', () => ({ source: route.query[SOURCE_FLAG] }));
    }
  });
};
</script>
<template>
  <LoginTemplate ref="loginTemplate" type="register" @submit="register">
    <template #switch>
      {{ i18n.HAVE_ACCOUNT }}
      &nbsp;
      <OLink color="primary" hover-underline @click="goLogin">{{ i18n.RETURN_LOGIN }}</OLink>
    </template>
    <template #headerTitle> {{ i18n.ACCOUNT_REGISTER }} </template>
    <template #btn> {{ i18n.REGISTER }} </template>
  </LoginTemplate>
</template>
<style lang="scss" scoped></style>
