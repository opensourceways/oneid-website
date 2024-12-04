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
import { ElMessage } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { haveLoggedIn } from 'shared/utils/login-success';
import { validLoginUrl } from 'shared/utils/login-valid-url';
import { useCommonData } from 'shared/stores/common';
import { getRsaEncryptWord } from 'shared/utils/rsa';
import { getVerifyImgSize } from 'shared/utils/utils';
import Verify from 'shared/verifition/Verify.vue';
import PadAccount from 'shared/components/PadAccount.vue';
import { ONLY_LOGIN_ID } from '@/shared/const';
import AgreePrivacy from '@/components/AgreePrivacy.vue';
import { getCommunityParams } from 'shared/utils/utils';

const i18n = useI18n();
const loginTemplate = ref<any>(null);
const router = useRouter();
const route = useRoute();
const privacyVisible = ref(false);
const goRegister = () => {
  router.push({
    path: '/register',
    query: route.query,
  });
};

const { loginParams } = useCommonData();

const visible = ref(false);
// 控制补全框内容
const padUserinfo = reactive({
  username: '',
});

// 判断是否需要补全内容
const isNotPadUserinfo = (data: any): boolean => {
  const { username, oneidPrivacyAccepted = '' } = data || {};
  const name = !username || username.startsWith('oauth2_') ? '' : username;
  if (oneidPrivacyAccepted !== import.meta.env?.VITE_ONEID_PRIVACYACCEPTED) {
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
    isLogined().then((bool) => {
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
    param.oneidPrivacyAccepted = import.meta.env?.VITE_ONEID_PRIVACYACCEPTED;
  }
  accountLoginPost(param).then((data: any) => {
    loginSuccess(data?.data);
  });
};

const verify = ref();
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
const agreePrivacy = () => {
  isLogined(getCommunityParams(true)).then((bool) => {
    if (bool) {
      if (isNotPadUserinfo(bool)) {
        haveLoggedIn();
      }
    }
  });
};
const cancelPad = () => {
  logout(getCommunityParams(true), location.href);
};
const onlyLogin = computed(
  () => ONLY_LOGIN_ID.includes(loginParams.value.client_id as string)
);
</script>
<template>
  <LoginTemplate
    ref="loginTemplate"
    @submit="chenckLogin"
    @three-part-login="threePartLogin"
  >
    <template #switch v-if="false">
      {{ i18n.NO_ACCOUNT }}
      &nbsp;
      <a @click="goRegister">{{ i18n.REGISTER_NOW }}</a>
    </template>
    <template #headerTitle> {{ i18n.ACCOUNT_LOGIN }} </template>
    <template #btn> {{ onlyLogin ? i18n.LOGIN : i18n.LOGIN_REGISTER }} </template>
  </LoginTemplate>
  <PadAccount
    v-model="visible"
    :username="padUserinfo.username"
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
  <AgreePrivacy
    v-model="privacyVisible"
    @success="agreePrivacy"
    @cancel="cancelPad"
  ></AgreePrivacy>
</template>
<style lang="scss" scoped></style>
