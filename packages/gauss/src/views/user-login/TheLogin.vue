<script setup lang="ts">
import { accountLoginPost } from 'shared/api/api-login';
import { useI18n } from 'shared/i18n';
import { isLogined } from 'shared/utils/login';
import { getCommunityParams } from '@/shared/utils';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { haveLoggedIn } from 'shared/utils/login-success';
import { getRsaEncryptWord } from 'shared/utils/rsa';
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
const goResetPwd = () => {
  router.push({
    path: '/resetPwd',
    query: route.query,
  });
};
onMounted(() => {
  isLogined(getCommunityParams(true)).then((bool) => {
    if (bool) {
      haveLoggedIn();
    }
  });
});

// 登录成功提示
const doSuccess = () => {
  ElMessage.success({
    showClose: true,
    message: i18n.value.LOGIN_SUCCESS,
  });
  haveLoggedIn();
};

// 登录成功处理函数
const loginSuccess = (data: any) => {
  doSuccess();
};
const login = async (form: any) => {
  const param: any = {
    ...getCommunityParams(true),
    account: form.account,
  };
  if (form.password) {
    const password = await getRsaEncryptWord(form.password);
    param.password = password;
  } else {
    param.code = form.code;
  }
  accountLoginPost(param).then((data: any) => {
    loginSuccess(data?.data);
  });
};
</script>
<template>
  <LoginTemplate ref="loginTemplate" @submit="login">
    <template #switch>
      <div style="flex: 1">
        <a style="display: inline" @click="goResetPwd()">
          {{ i18n.FORGET_PWD }}
        </a>
      </div>
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
.form {
  padding: 0 28px;
}
.footer {
  display: flex;
  justify-content: center;
  padding-bottom: 28px;
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
