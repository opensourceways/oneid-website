<script setup lang="ts">
import { accountRegisterPost } from 'shared/api/api-login';
import { getRsaEncryptWord } from 'shared/utils/rsa';
import { useI18n } from 'shared/i18n';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { getCommunityParams } from '@/shared/utils';
const loginTemplate = ref<any>(null);
const router = useRouter();
const route = useRoute();
const i18n = useI18n();
const goLogin = () => {
  router.push({
    path: '/login',
    query: route.query,
  });
};
const register = async (form: any) => {
  const param: any = {
    ...getCommunityParams(true),
    username: form.username,
    account: form.account,
    code: form.code,
    company: form.company,
  };
  if (form.password) {
    const password = await getRsaEncryptWord(form.password);
    param.password = password;
  }
  accountRegisterPost(param).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.REGISTER_SUCCESS,
    });
    goLogin();
  });
};
</script>
<template>
  <LoginTemplate ref="loginTemplate" type="register" @submit="register">
    <template #switch>
      {{ i18n.HAVE_ACCOUNT }}
      &nbsp;
      <a @click="goLogin">{{ i18n.RETURN_LOGIN }}</a>
    </template>
    <template #headerTitle> {{ i18n.ACCOUNT_REGISTER }} </template>
    <template #btn> {{ i18n.REGISTER }} </template>
  </LoginTemplate>
</template>
<style lang="scss" scoped></style>
