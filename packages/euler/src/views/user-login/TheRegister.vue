<script setup lang="ts">
import { accountRegister } from 'shared/api/api-login';
import { useI18n } from 'shared/i18n';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { useCommonData } from 'shared/stores/common';
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
const { loginParams } = useCommonData();
const register = (form: any) => {
  const param = {
    username: form.username,
    account: form.account,
    code: form.code,
    client_id: loginParams.value.client_id,
  };
  accountRegister(param).then(() => {
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
