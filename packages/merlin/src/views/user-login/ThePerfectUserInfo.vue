<script setup lang="ts" >
import { ref, provide, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'shared/i18n';
import { ODialog, OButton, useMessage } from '@opensig/opendesign';
import LoginTemplate from './components/LoginTemplate.vue';
import { bindAccount, mergeUser, sendCode } from 'shared/api/api-center';
import { haveLoggedIn } from 'shared/utils/login-success';
import { useCommonData } from 'shared/stores/common';
import { logout } from 'shared/utils/login';
import { setLogoutSession } from 'shared/utils/login';
import { saveUserAuth } from 'shared/utils/login';
import { sendCodeCaptcha } from 'shared/api/api-login';
const code = ref('');
provide('loginErr', code);
type STEP = 'PERFECT' | 'BINGDING' | 'SUCCESS';
const i18n = useI18n();
const showDialog = ref(false)
const curStep = ref<STEP>('PERFECT');
const hasUsedTip = ref('');
const { loginParams } = useCommonData();
const message = useMessage();
const doSubmit = (form: any) => {
  if (curStep.value === 'PERFECT') {
    doPerfectSubmit(form);
  } else {
    doBindingSubmit(form);
  }
};
// 完善用户手机号提交
const doPerfectSubmit = (form: any) => {
  const params = {
    account: form.account,
    account_type: 'phone',
    code: form.code,
  }
  bindAccount(params).then(data => {
    const { code, msg } = data;
    if (code === 200) {
      doSuccess(form.account);
      form.code = '';
      form.account = '';
      curStep.value = 'SUCCESS';
    } else if (code === 400 || msg?.code === 'E0003') {
      // 自动绑定一次
      doBindingSubmit(form, 'auto');
    } else {
      toLogout();
    }
  });
}
// 绑定手机号提交
const doBindingSubmit = (form: any, operateOrigin = 'manul') => {
  const params = {
    client_id: loginParams.value.client_id,
    account: form.account,
    code: form.code,
  }
  mergeUser(params).then(data => {
    const { code } = data;
    if (code === 200) {
      curStep.value = 'SUCCESS';
      doSuccess(form.account);
      form.code = '';
      form.account = '';
    } else if (operateOrigin === 'auto') { // 自动绑定没有成功，在显示绑定页面让用户手动输入提交
      form.code = '';
      form.account = '';
      hasUsedTip.value = i18n.value.HAS_REGISTER_TIP?.replace(/\$\{.*?\}/g, form.account);
      showDialog.value = true;
    } else { // 绑定失败
      toLogout();
    }
  })
}
// 登出到登录页面
const toLogout = () => {
  logout(undefined, `${location.origin}/login${location.search}`)
}
// 登录成功提示
const doSuccess = (phone: string | number) => {
  message.success({
    content: i18n.value.LOGIN_SUCCESS,
  });
  setLogoutSession();
  haveLoggedIn(phone);
};
const doBinding = () => {
  curStep.value = 'BINGDING';
  showDialog.value = false;
}
const quit = () => {
  showDialog.value = false;
  toLogout();
}
// 监听页面卸载，刷新时清空cookie
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
})
onBeforeUnmount(() => {
  if (curStep.value !== 'SUCCESS') {
    saveUserAuth();
    window.location.href = `${location.origin}/login${location.search}`;
  }
  window.removeEventListener('beforeunload', handleBeforeUnload);
})
const handleBeforeUnload = () => {
  if (curStep.value !== 'SUCCESS') {
    saveUserAuth();
    window.location.href = `${location.origin}/login${location.search}`;
  }
}
// 发送验证码，完善用户信息和绑定用两个接口
const doSendCode = (form: any, data: any) => {
  if (curStep.value === 'PERFECT') {
    const param = {
      account: form.account,
      channel: 'channel_bind_phone',
      captchaVerification: data.captchaVerification,
    };
    sendCode(param).then(() => {
      message.success({
        content: i18n.value.SEND_SUCCESS,
      });
    });
  } else if (curStep.value === 'BINGDING'){
    const param = {
      channel: 'CHANNEL_LOGIN',
      account: form.account,
      captchaVerification: data.captchaVerification,
      client_id: loginParams.value.client_id,
    };
    sendCodeCaptcha(param).then(() => {
      message.success({
       content: i18n.value.SEND_SUCCESS,
      });
    });
  }
}
</script>

<template>
  <LoginTemplate ref="logintemplate1" type="perfectUserInfo" @submit="doSubmit" @sendCode="doSendCode">
    <template #headerTitle>
      {{ curStep === 'PERFECT' ? i18n.PERFECT_USER_INFO : i18n.BINDING_CUR_ACCOUNT }}
    </template>
    <template #headerTitleTip>
      {{ curStep === 'PERFECT' ? i18n.PERFECT_USER_INFO_TIPS : i18n.BINDING_CUR_ACCOUNT_TIP }}
    </template>
    <template #btn>{{ curStep === 'PERFECT' ? i18n.SUBMIT : i18n.BINDING }}</template>
  </LoginTemplate>
  <ODialog v-model:visible="showDialog" size="small">
    <template #header>{{ i18n.HAS_REGISTER }}</template>
    <div>{{ hasUsedTip }}</div>
    <template #footer>
      <div class="foot-btn-wrap">
        <OButton color="primary" size="large" variant="solid" @click="doBinding">{{ i18n.QUIC_BINDING }}</OButton>
        <OButton size="large" @click="quit" class="ml16">{{ i18n.CANCEL }}</OButton>
      </div>
    </template>
  </ODialog>
</template>

<style lang="scss" scoped>
.foot-btn-wrap {
  display: flex;
  justify-content: center;
  text-align: center;
  .ml16{
    margin-left: 16px;
  }
}
</style>
