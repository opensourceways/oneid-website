<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import LoginCard from './components/LoginCard.vue';
import LoginForm from './components/LoginForm.vue';
import LoginLanguage from 'shared/components/LoginLanguage.vue';
import { getSessionStorage, setSessionStorage } from 'shared/utils/utils';
import {
  accountRegisterPost,
  providerLink,
  providerRegister,
} from 'shared/api/api-login';
import { useCommonData } from 'shared/stores/common';
import { ElMessage } from 'element-plus';
import { useI18n } from 'shared/i18n';
import { haveLoggedIn } from 'shared/utils/login-success';
import { getCommunityParams } from '@/shared/utils';

type TYPE = 'login' | 'register';
const type = ref<TYPE>();
const curPage = 'THE_TRIPARTITE_TYPE';

const preForm = ref();

const { loginParams } = useCommonData();
const i18n = useI18n();

onMounted(() => {
  // 缓存的状态
  type.value = getSessionStorage(curPage) as TYPE;
});

const createAccount = () => {
  const param = {
    community: import.meta.env?.VITE_COMMUNITY,
  };
  providerRegister(param).then((data) => {
    preForm.value = data;
    type.value = 'register';
    setSessionStorage(curPage, type.value);
  });
};
const bindAccount = () => {
  preForm.value = null;
  type.value = 'login';
  setSessionStorage(curPage, type.value);
};
const returnUpper = () => {
  type.value = undefined;
  setSessionStorage(curPage, type.value);
};

const submit = (form: any) => {
  if (type.value === 'login') {
    const param = {
      client_id: loginParams.value.client_id,
      account: form.account,
      code: form.code,
      community: import.meta.env?.VITE_COMMUNITY,
    };
    providerLink(param).then(() => {
      doSuccess();
    });
  } else {
    const param = {
      ...getCommunityParams(true),
      username: form.username,
      account: form.account,
      code: form.code,
      company: form.company,
    };
    accountRegisterPost(param).then(() => {
      doSuccess();
    });
  }
};

// 登录成功提示
const doSuccess = () => {
  ElMessage.success({
    showClose: true,
    message: i18n.value.LOGIN_SUCCESS,
  });
  haveLoggedIn();
};
</script>

<template>
  <LoginCard>
    <div v-if="!type" class="select">
      <OButton class="btn" @click="createAccount"> 新建账号 </OButton>
      <OButton type="primary" class="btn" @click="bindAccount">
        绑定已有账号
      </OButton>
    </div>
    <template v-else>
      <a class="return-upper" @click="returnUpper">{{ '< 返回上一级' }}</a>
      <LoginForm :type="type" :pre-form="preForm" @submit="submit">
        <template #btn>
          {{ type === 'login' ? '绑定已有账号' : '新建账号' }}
        </template>
      </LoginForm>
    </template>
    <LoginLanguage></LoginLanguage>
  </LoginCard>
</template>

<style lang="scss" scoped>
.select {
  display: grid;
  row-gap: var(--o-spacing-h7);
  .btn {
    width: 100%;
    justify-content: center;
  }
}
.return-upper {
  display: inline-block;
  padding-bottom: var(--o-spacing-h4);
  font-size: var(--o-font-size-text);
}
</style>
