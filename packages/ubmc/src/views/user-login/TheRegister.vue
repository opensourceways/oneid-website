<script setup lang="ts">
import { accountRegisterPost } from 'shared/api/api-login';
import { getRsaEncryptWord } from 'shared/utils/rsa';
import { useI18n } from 'shared/i18n';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { useCommonData } from 'shared/stores/common';
import { OLink, useMessage } from '@opensig/opendesign';
import { getPrivacyVersion } from 'shared/utils/utils';
const loginTemplate = ref<any>(null);
const router = useRouter();
const route = useRoute();
const i18n = useI18n();
const message = useMessage();
const goLogin = () => {
  router.push({
    path: '/login',
    query: route.query,
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
    message.success({
      content: i18n.value.REGISTER_SUCCESS,
    });
    goLogin();
  });
};
</script>
<template>
  <LoginTemplate ref="loginTemplate" type="register" @submit="register">
    <template #switch>
      <label>{{ i18n.HAVE_ACCOUNT }}</label>
      &nbsp;
      <OLink color="primary" hover-underline @click="goLogin">{{
        i18n.RETURN_LOGIN
      }}</OLink>
    </template>
    <template #headerTitle> {{ i18n.ACCOUNT_REGISTER }} </template>
    <template #btn> {{ i18n.REGISTER }} </template>
  </LoginTemplate>
</template>
<style lang="scss" scoped></style>
