<script setup lang="ts">
import {
  accountLoginPost,
  queryToken,
  checkLoginAccount,
} from 'shared/api/api-login';
import { useI18n } from 'shared/i18n';
import {
  getLogoutSession,
  isLogined,
  logout,
  setLogoutSession,
} from 'shared/utils/login';
import { OLink, useMessage, ODivider } from '@opensig/opendesign';
import { onMounted, reactive, ref, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { haveLoggedIn } from 'shared/utils/login-success';
import { validLoginUrl } from 'shared/utils/login-valid-url';
import { useCommonData } from 'shared/stores/common';
import { getRsaEncryptWord } from 'shared/utils/rsa';
import { getVerifyImgSize, callBackErrMessage } from 'shared/utils/utils';
import Verify from 'shared/verifition/Verify.vue';
import PadAccount from '@/components/PadAccount.vue';
import AgreePrivacy from '@/components/AgreePrivacy.vue';

const i18n = useI18n();
const loginTemplate = ref<any>(null);
const message = useMessage();

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
const { loginParams, selectLoginType } = useCommonData();
const privacyVisible = ref(false);
const visible = ref(false);
// 控制补全框内容
const padUserinfo = reactive({
  username: '',
});

// 判断是否需要补全内容
const isNotPadUserinfo = (data: any): boolean => {
  const { username, oneidPrivacyAccepted = '', } = data || {};
  const name = !username || username.startsWith('oauth2_') ? '' : username;
  if (
    oneidPrivacyAccepted !== import.meta.env?.VITE_ONEID_PRIVACYACCEPTED
  ) {
    privacyVisible.value = true;
    return false;
  } else if (!name) {
    padUserinfo.username = name;
    visible.value = true;
    return false;
  }
  return true;
};
onMounted(() => {
  validLoginUrl().then(() => {
    isLogined({}).then((bool) => {
      if (bool) {
        if (isNotPadUserinfo(bool)) {
          haveLoggedIn();
        }
      } else if (!getLogoutSession()) {
        setLogoutSession(true);
      }
    });
  });
});

// 登录成功提示
const doSuccess = () => {
  message.success({
    content: i18n.value.LOGIN_SUCCESS,
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

// 登录失败输入框变红
const code = ref('')
provide('loginErr', code);
const login = async (form: any, captchaVerification?: string) => {
  const param: any = {
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
  accountLoginPost(param, { $doException: true }).then((data: any) => {
    loginSuccess(data?.data);
  }).catch((err) => {
    message.danger({
      content: callBackErrMessage(err),
    });
    code.value = err.response.data.msg.code;
  });
};

const formCopy = ref(null);

// 密码登录前检查账号
const chenckLogin = (form: any) => {
  formCopy.value = form;
  const param = {
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
    redirect,
    client_id: loginParams.value.client_id,
  };
  queryToken(param).then((data: any) => {
    loginSuccess(data?.data);
  });
};
const cancelPad = () => {
  logout({}, location.href);
};
const agreePrivacy = () => {
  isLogined({}).then((bool) => {
    if (bool) {
      if (isNotPadUserinfo(bool)) {
        haveLoggedIn();
      }
    }
  });
}
</script>
<template>
  <LoginTemplate
    ref="loginTemplate"
    @submit="chenckLogin"
    @three-part-login="threePartLogin"
  >
    <template #switch v-if="selectLoginType === 'password'">
      <OLink color="primary" hover-underline @click="goRegister">{{ i18n.REGISTER_NOW }}</OLink>
      <ODivider direction="v" />
      <OLink color="primary" hover-underline @click="goResetPwd()">{{ i18n.FORGET_PWD }}</OLink>
    </template>
    <template #headerTitle> {{ i18n.ACCOUNT_LOGIN }} </template>
    <template #btn> {{ selectLoginType === 'code' ? i18n.LOGIN_REGISTER : i18n.LOGIN }} </template>
  </LoginTemplate>
  <PadAccount
    v-model="visible"
    :username="padUserinfo.username"
    @success="doSuccess"
    @cancel="cancelPad"
  ></PadAccount>
  <AgreePrivacy
    v-model="privacyVisible"
    @success="agreePrivacy"
    @cancel="cancelPad"
  ></AgreePrivacy>
  <Verify
    ref="verify"
    mode="pop"
    captcha-type="blockPuzzle"
    :img-size="getVerifyImgSize()"
    @success="verifySuccess"
  ></Verify>
</template>
<style lang="scss" scoped></style>
