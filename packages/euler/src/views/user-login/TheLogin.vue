<script setup lang="ts">
import {
  accountLoginPost,
  queryToken,
  checkLoginAccount,
} from 'shared/api/api-login';
import PadAccount from 'shared/components/PadAccount.vue';
import { useI18n } from 'shared/i18n';
import {
  getLogoutSession,
  isLogined,
  logout,
  setLogoutSession,
} from 'shared/utils/login';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { haveLoggedIn } from 'shared/utils/login-success';
import { validLoginUrl } from 'shared/utils/login-valid-url';
import { useCommonData } from 'shared/stores/common';
import Verify from 'shared/verifition/Verify.vue';
import { getRsaEncryptWord } from 'shared/utils/rsa';
import { getVerifyImgSize } from 'shared/utils/utils';

const i18n = useI18n();
const loginTemplate = ref<any>(null);
const visible = ref(false);
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
const verify = ref();
const { loginParams } = useCommonData();

// 控制补全框内容
const padUserinfo = reactive({
  username: '',
  emailExist: false,
});

// 判断是否需要补全内容
const isNotPadUserinfo = (data: any): boolean => {
  const { username, email_exist: emailExist = false, email = '' } = data || {};
  const name = !username || username.startsWith('oauth2_') ? '' : username;
  let hasEmail = true;
  if (
    loginParams.value.response_mode === 'query' &&
    loginParams.value.scope?.includes('email')
  ) {
    // oidc模式选择了email，才需要补全邮箱功能
    hasEmail = Boolean(emailExist || email);
  }
  if (!name || !hasEmail) {
    padUserinfo.username = name;
    padUserinfo.emailExist = hasEmail;
    visible.value = true;
    return false;
  }
  return true;
};
onMounted(() => {
  validLoginUrl().then(() => {
    isLogined().then((bool) => {
      if (bool) {
        if (isNotPadUserinfo(bool)) {
          haveLoggedIn();
        }
      } else if (!getLogoutSession()) {
        setLogoutSession(true);
        window.location.href = `${
          import.meta.env?.VITE_LOGIN_USERPOOL
        }/login/profile/logout?app_id=${
          loginParams.value.client_id
        }&redirect_uri=${encodeURIComponent(location.href)}`;
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
  if (isNotPadUserinfo(data)) {
    doSuccess();
  }
};

const login = async (form: any, captchaVerification?: string) => {
  const param: any = {
    community: import.meta.env?.VITE_COMMUNITY,
    permission: 'sigRead',
    account: form.account,
    client_id: loginParams.value.client_id,
    accept_term: 0,
  };
  if (captchaVerification) {
    param.captchaVerification = captchaVerification;
  }
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

const formCopy = ref(null);

// 密码登录前检查账号
const chenckLogin = (form: any) => {
  formCopy.value = form;
  const param = {
    community: import.meta.env?.VITE_COMMUNITY,
    account: form.account,
  };
  checkLoginAccount(param).then((data) => {
    if (data?.data?.need_captcha_verification) {
      verify.value.show();
    } else {
      login(form);
    }
  });
};

const verifySuccess = (data: any) => {
  login(formCopy.value, data.captchaVerification);
};

const threePartLogin = (res: any) => {
  const { code, redirect_uri: redirect } = res;
  const param = {
    code: code,
    permission: 'sigRead',
    community: import.meta.env?.VITE_COMMUNITY,
    redirect,
    client_id: loginParams.value.client_id,
  };
  queryToken(param).then((data: any) => {
    loginSuccess(data?.data);
  });
};

const cancelPad = () => {
  if (loginParams.value.response_mode === 'query' || !padUserinfo.username) {
    logout();
  } else {
    doSuccess();
  }
};
</script>
<template>
  <LoginTemplate
    ref="loginTemplate"
    @submit="chenckLogin"
    @three-part-login="threePartLogin"
  >
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
  <PadAccount
    v-model="visible"
    :username="padUserinfo.username"
    :email-exist="padUserinfo.emailExist"
    @success="doSuccess"
    @cancel="cancelPad"
  ></PadAccount>
  <Verify
    ref="verify"
    mode="pop"
    captcha-type="blockPuzzle"
    :img-size="getVerifyImgSize()"
    @success="verifySuccess"
  ></Verify>
</template>
<style lang="scss" scoped></style>
