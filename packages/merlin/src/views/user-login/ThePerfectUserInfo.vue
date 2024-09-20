<script setup lang="ts" >
import { ref, provide, onMounted } from 'vue';
import { useI18n } from 'shared/i18n';
import { ODialog, OButton, useMessage } from '@opensig/opendesign';
import LoginTemplate from './components/LoginTemplate.vue';
import { bindAccount, mergeUser } from 'shared/api/api-center';
import { haveLoggedIn } from 'shared/utils/login-success';
import { useCommonData } from 'shared/stores/common';
import { logout } from 'shared/utils/login';

import {
  setLogoutSession,
} from 'shared/utils/login';
const message = useMessage();
const code = ref('')
provide('loginErr', code);
type STEP = 'PERFECT' | 'BINGDING'
const i18n = useI18n()
const showDialog = ref(false)
const curStep = ref<STEP>('PERFECT')
const hasUsedTip = ref('');
const { loginParams } = useCommonData();
const doSubmit = (form: any) => {
  if (curStep.value === 'PERFECT') {
    doPerfectSubmit(form)
  } else {
    doBindingSubmit(form)
  }
}
const doPerfectSubmit = (form: any) => {
  const params = {
    account: form.phone,
    account_type: 'phone',
    code: form.code
  }
  bindAccount(params).then(res => {
    const {code} = res.data
    if (code === 200) {
      form.code = ''
      form.account = ''
      doSuccess()
      message.success({
        content: res.data.message,
      });
    } else {
      hasUsedTip.value = i18n.value.HAS_REGISTER_TIP?.replace(/\$\{.*?\}/g, form.phone)
      curStep.value = 'BINGDING'
      showDialog.value = true
    }
  });
}
const doBindingSubmit = (form: any) => {
  const params = {
    client_id: loginParams.value.client_id,
    account: form.phone,
    code: form.code
  }
  mergeUser(params).then(res => {
    const {code} = res.data
    if (code === 200) {
      form.code = ''
      form.account = ''
      doSuccess()
      message.success({
        content: res.data.message,
      });
    } else {
      logout()
    }
  })
}
// 登录成功提示
const doSuccess = () => {

  setLogoutSession();
  haveLoggedIn();
};
const doBinding = () => {
  showDialog.value = false
}
const quit = () => {
  showDialog.value = false
}

</script>

<template>
  <LoginTemplate ref="logintemplate1" type="perfectUserInfo" @submit="doSubmit">
    <template #headerTitle>
      {{ curStep === 'PERFECT' ? i18n.PERFECT_USER_INFO : i18n.BINDING_CUR_ACCOUNT }}
    </template>
    <template #headerTitleTip>
      {{ curStep === 'PERFECT' ? i18n.PERFECT_USER_INFO_TIPS : i18n.BINDING_CUR_ACCOUNT_TIP }}
    </template>
    <template #btn>{{ curStep === 'PERFECT' ? i18n.SUBMIT : i18n.BINGDING }}</template>
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