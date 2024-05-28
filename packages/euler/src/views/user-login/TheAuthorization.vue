<script lang="ts" setup>
// import ResetPwd from 'shared/components/ResetPwd.vue';
import { useCommonData } from 'shared/stores/common';
import { logout } from 'shared/utils/login';
import { getOidcUri } from 'shared/utils/login-success';
import { ref } from 'vue';
import LoginCard from './components/LoginCard.vue';

const policy = ref([]);
const { loginParams } = useCommonData();
const reject = () => {
  const url = new URL(window.location.href);
  url.pathname = '/login'
  logout(undefined, url.toString())
};
const agree = () => {
  if (policy.value.length) {
    getOidcUri(loginParams.value)
  }
}
</script>

<template>
  <LoginCard>
    <p style="margin-bottom: 24px">第三方应用请求获得以下权限</p>
    <OCheckboxGroup
      v-model="policy"
    >
      <OCheckbox value="1">获取您的用户名、头像、手机号、邮箱、sig组</OCheckbox>
    </OCheckboxGroup>
    <div class="btns">
      <OButton size="small" @click="agree" :disabled="!policy.length">同意</OButton>
      <OButton size="small" @click="reject">拒绝</OButton>
    </div>
  </LoginCard>
</template>

<style lang="scss" scoped>
.btns {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  column-gap: 24px;
}
</style>
