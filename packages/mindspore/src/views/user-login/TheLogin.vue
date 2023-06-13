<script setup lang="ts">
import { accountLogin, queryToken } from 'shared/api/api-login';
import { useI18n } from 'shared/i18n';
import {
  getLogoutSession,
  isLogined,
  setLogoutSession,
} from 'shared/utils/login';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { haveLoggedIn } from 'shared/utils/login-success';
import { validLoginUrl } from 'shared/utils/login-valid-url';
import { useCommonData } from 'shared/stores/common';

const i18n = useI18n();
const loginTemplate = ref<any>(null);
const router = useRouter();
const route = useRoute();
const goRegister = () => {
  router.push({
    path: '/register',
    query: route.query,
  });
};
const { loginParams } = useCommonData();
onMounted(() => {
  validLoginUrl().then(() => {
    isLogined().then((bool) => {
      if (bool) {
        haveLoggedIn();
      } else if (!getLogoutSession()) {
        setLogoutSession(true);
        window.location.href = `${
          import.meta.env?.VITE_LOGIN_USERPOOL
        }/login/profile/logout?app_id=${
          loginParams.value.client_id
        }&redirect_uri=${location.href.replaceAll('&', '%26')}`;
      }
    });
  });
});

// 登录成功提示
const doSuccess = () => {
  ElMessage.success({
    showClose: true,
    message: i18n.value.LOGIN_SUCCESS,
  });
  setLogoutSession();
  haveLoggedIn();
};

// 登录成功处理函数
const loginSuccess = (data: any) => {
  doSuccess();
};
const login = (form: any) => {
  const param = {
    community: import.meta.env?.VITE_COMMUNITY,
    permission: 'sigRead',
    account: form.account,
    code: form.code,
    client_id: loginParams.value.client_id,
  };
  accountLogin(param).then((data: any) => {
    loginSuccess(data?.data);
  });
};
const threePartLogin = (res: any) => {
  const { code, redirect_uri } = res;
  const param = {
    code: code,
    permission: 'sigRead',
    community: import.meta.env?.VITE_COMMUNITY,
    redirect: redirect_uri,
    client_id: loginParams.value.client_id,
  };
  queryToken(param).then((data: any) => {
    loginSuccess(data?.data);
  });
};
</script>
<template>
  <LoginTemplate
    ref="loginTemplate"
    @submit="login"
    @three-part-login="threePartLogin"
  >
    <template #switch>
      {{ i18n.NO_ACCOUNT }}
      &nbsp;
      <a @click="goRegister">{{ i18n.REGISTER_NOW }}</a>
    </template>
    <template #headerTitle> {{ i18n.ACCOUNT_LOGIN }} </template>
    <template #btn> {{ i18n.LOGIN }} </template>
  </LoginTemplate>
</template>
<style lang="scss" scoped>
.header {
  font-size: var(--o-font-size-h5);
  line-height: var(--o-line-height-h5);
  font-weight: normal;
  text-align: center;
  margin-left: var(--o-spacing-h5);
  padding-top: 28px;
}
.footer {
  display: flex;
  justify-content: center;
  padding-bottom: 28px;
  column-gap: 24px;
}
.code {
  display: grid;
  grid-template-columns: auto max-content;
  width: 100%;
  grid-gap: var(--o-spacing-h9);
}
.btn {
  height: 38px;
}
.el-form-item {
  margin-bottom: 28px;
  @media (max-width: 1100px) {
    margin-bottom: 40px;
  }
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
</style>
