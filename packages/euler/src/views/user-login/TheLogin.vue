<script setup lang="ts">
import {
  accountLoginPost,
  queryToken,
  checkLoginAccount,
} from 'shared/api/api-login';
import PadAccount from 'shared/components/PadAccount.vue';
import AgreePrivacy from 'shared/components/AgreePrivacy.vue';
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
import Verify from 'shared/verifition/Verify.vue';
import { getRsaEncryptWord } from 'shared/utils/rsa';
import { getVerifyImgSize } from 'shared/utils/utils';
import { ONLY_LOGIN_ID } from '@/shared/const';

const i18n = useI18n();
const loginTemplate = ref<any>(null);
const visible = ref(false);
const privacyVisible = ref(false);
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

// 控制补全框内容
const padUserinfo = reactive({
  username: '',
  emailExist: false,
  phoneExist: false,
});

// 判断是否需要补全内容
const isNotPadUserinfo = (data: any): boolean => {
  const {
    username,
    email_exist: emailExist = false,
    phone_exist: phoneExist = false,
    email = '',
    phone='',
    oneidPrivacyAccepted = '',
  } = data || {};
  const name = !username || username.startsWith('oauth2_') ? '' : username;
  let hasEmail = true;
  let hasPhone = true;
  if (route.query?.complementation) {
    const complementation = route.query?.complementation;
    if (complementation === 'phone') {
      hasPhone = Boolean(phoneExist || phone)
    } else if (complementation === 'email') {
      hasEmail = Boolean(emailExist || email);
    }
  }
  if (
    oneidPrivacyAccepted !== import.meta.env?.VITE_ONEID_PRIVACYACCEPTED
  ) {
    privacyVisible.value = true;
    return false;
  } else if (!name || !hasEmail || !hasPhone) {
    padUserinfo.username = name;
    padUserinfo.emailExist = hasEmail;
    padUserinfo.phoneExist = hasPhone;
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

const agreePrivacy = () => {
  isLogined().then((bool) => {
    if (bool) {
      if (isNotPadUserinfo(bool)) {
        haveLoggedIn();
      }
    }
  });
}
const showSwitch = computed(
  () => !ONLY_LOGIN_ID.includes(loginParams.value.client_id as string) && selectLoginType.value === 'password'
);
</script>
<template>
  <LoginTemplate
    ref="loginTemplate"
    @submit="chenckLogin"
    @three-part-login="threePartLogin"
  >
    <template v-if="showSwitch" #switch>
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
  </LoginTemplate>
  <PadAccount
    v-model="visible"
    :username="padUserinfo.username"
    :email-exist="padUserinfo.emailExist"
    :phone-exist="padUserinfo.phoneExist"
    @success="doSuccess"
    @cancel="cancelPad"
  ></PadAccount>
  <AgreePrivacy
    v-model="privacyVisible"
    @success="agreePrivacy"
    @cancel="logout"
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
