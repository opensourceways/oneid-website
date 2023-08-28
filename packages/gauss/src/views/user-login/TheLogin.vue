<script setup lang="ts">
import { accountLoginPost, checkLoginAccount } from 'shared/api/api-login';
import { useI18n } from 'shared/i18n';
import { isLogined } from 'shared/utils/login';
import { getCommunityParams } from '@/shared/utils';
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { haveLoggedIn } from 'shared/utils/login-success';
import { getRsaEncryptWord } from 'shared/utils/rsa';
import Verify from 'shared/verifition/Verify.vue';
import { getVerifyImgSize } from 'shared/utils/utils';
import { validLoginUrl } from 'shared/utils/login-valid-url';
import { ONLY_LOGIN_ID } from '@/shared/const';
import { useCommonData } from 'shared/stores/common';
const i18n = useI18n();
const loginTemplate = ref<any>(null);
const { loginParams } = useCommonData();
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
  validLoginUrl().then(() => {
    isLogined(getCommunityParams(true)).then((bool) => {
      if (bool) {
        haveLoggedIn();
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
  haveLoggedIn();
};

// 登录成功处理函数
const loginSuccess = (data: any) => {
  doSuccess();
};

const login = async (form: any, captchaVerification?: string) => {
  const param: any = {
    ...getCommunityParams(true),
    account: form.account,
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
const showSwitch = computed(
  () => !ONLY_LOGIN_ID.includes(loginParams.value.client_id as string)
);
</script>
<template>
  <LoginTemplate ref="loginTemplate" @submit="chenckLogin">
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
    <template #btn> {{ i18n.LOGIN }} </template>
  </LoginTemplate>
  <Verify
    ref="verify"
    mode="pop"
    captcha-type="blockPuzzle"
    :img-size="getVerifyImgSize()"
    @success="verifySuccess"
  ></Verify>
</template>
<style lang="scss" scoped></style>
