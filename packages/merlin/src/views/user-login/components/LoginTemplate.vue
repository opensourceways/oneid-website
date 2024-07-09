<script setup lang="ts">
import IconGithub from '~icons/app/icon-github.svg';
import IconGitee from '~icons/app/icon-gitee.svg';
import ContentTemplate from './ContentTemplate.vue';
import LoginForm from './LoginForm.vue';
import { computed, onMounted, onUnmounted, PropType, ref, toRefs } from 'vue';
import { useI18n } from 'shared/i18n';
import { getUrlByParams } from 'shared/utils/utils';
import { useCommonData } from 'shared/stores/common';
import { OIcon } from '@opensig/opendesign';
import { ONLY_LOGIN_ID } from '@/shared/const';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const emit = defineEmits(['submit', 'threePartLogin']);

const { type } = toRefs(props);
const i18n = useI18n();
const { lang, loginParams } = useCommonData();
const loginForm = ref();

// 三方登录
const redirectUri = `${location.origin}/login`;
const windowOpener = ref();
const threePartsLogin = (type: string) => {
  const url = `${import.meta.env?.VITE_LOGIN_USERPOOL}/api/v3/signin-by-extidp`;
  const params = {
    client_id: loginParams.value.client_id,
    response_type: loginParams.value.response_type,
    redirect_uri: redirectUri,
    scope: 'openid profile username email',
    state: loginParams.value.state,
    nonce: loginParams.value.nonce,
    lang: lang.value === 'zh' ? 'zh-CN' : 'en-US',
    response_mode: 'web_message',
  };
  const connIds: any = {
    Gitee: '658a93971008d6c7e0bc5bc0',
    GitHub: '658a836f19a1edc70c8398d6',
  };
  Object.assign(params, { ext_idp_conn_id: connIds[type] });
  loginForm.value?.validator('policy').subscribe((valid: boolean) => {
    if (valid) {
      windowOpener.value = window.open(
        getUrlByParams(url, params),
        '_blank',
        `width=500,height=700,left=${(screen.width - 500) / 2},top=${
          (screen.height - 700) / 2
        }`
      );
    } else {
      return false;
    }
  });
};

const icons = [
  {
    key: 'Gitee',
    icon: IconGitee,
    onClick: (type: string) => {
      threePartsLogin(type);
    },
  },
  {
    key: 'GitHub',
    icon: IconGithub,
    onClick: (type: string) => {
      threePartsLogin(type);
    },
  },
];

const loginFun = (e: MessageEvent) => {
  const { type, response } = e.data;
  if (type !== 'authorization_response') {
    return;
  }
  const { code, state } = response;
  if (code && state) {
    windowOpener.value?.close();
    const param = {
      code,
      redirect_uri: redirectUri,
    };
    emit('threePartLogin', param);
  }
};

// 监听三方登录结果
const listenerThreePartsLogin = () => {
  window.addEventListener('message', loginFun);
};

const submit = (form: any) => {
  emit('submit', form);
};
onMounted(() => {
  listenerThreePartsLogin();
});
onUnmounted(() => {
  // 移除监听
  window.removeEventListener('message', loginFun);
});
const showFooter = computed(
  () =>
    type.value === 'login' &&
    !ONLY_LOGIN_ID.includes(loginParams.value.client_id as string)
);
</script>
<template>
  <ContentTemplate>
    <template #headerTitle>
      <slot name="headerTitle"> {{ i18n.ACCOUNT_LOGIN }} </slot>
    </template>
    <template #switch>
      <slot name="switch"></slot>
    </template>
    <template #body>
      <LoginForm ref="loginForm" :type="type" @submit="submit">
        <template #btn>
          <slot name="btn"></slot>
        </template>
      </LoginForm>
    </template>
    <template #footer v-if="showFooter">
      <div class="app-footer">
        <div class="divider">
          <div class="line"></div>
          <div class="other">{{ i18n.THREE_PART_LOGIN }}</div>
          <div class="line"></div>
        </div>
        <div class="three-parts">
          <div
            v-for="(item, index) in icons"
            :key="item.key"
            @click="item.onClick(item.key)"
          >
            <OIcon class="icon" :class="{ gap: index }">
              <component :is="item.icon"></component>
            </OIcon>
          </div>
        </div>
      </div>
    </template>
  </ContentTemplate>
</template>
<style lang="scss" scoped>
.gap {
  margin-left: 40px;
}
.icon {
  font-size: 36px;
  cursor: pointer;
}
.app-footer {
  padding-top: 24px;
  .divider {
    display: grid;
    grid-template-columns: auto max-content auto;
    justify-items: center;
    align-items: center;
    .line {
      width: 100%;
      border-top: 1px solid var(--o-color-division1);
    }
    .other {
      padding-left: var(--o-spacing-h5);
      padding-right: var(--o-spacing-h5);
      font-size: var(--o-font-size-h8);
      line-height: var(--o-line-height-h8);
      color: var(--o-color-text4);
    }
  }
  .three-parts {
    padding-top: var(--o-spacing-h4);
    display: flex;
    justify-content: center;
  }
}
</style>
