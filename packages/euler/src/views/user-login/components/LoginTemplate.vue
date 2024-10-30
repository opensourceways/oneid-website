<script setup lang="ts">
import IconGithub from '~icons/app/icon-github.svg';
import IconGitee from '~icons/app/icon-gitee.svg';
import IconOpenAtom from '~icons/app/icon-openatom.svg';
import ContentTemplate from './ContentTemplate.vue';
import LoginForm from './LoginForm.vue';
import { computed, onMounted, onUnmounted, PropType, ref, toRefs } from 'vue';
import { useI18n } from 'shared/i18n';
import { getUrlByParams, isWeChat } from 'shared/utils/utils';
import { useCommonData } from 'shared/stores/common';
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
const redirectUri = `${import.meta.env.VITE_LOGIN_ORIGIN}/login`;
const windowOpener = ref();
const threePartsLogin = (type: string) => {
  const url = `${import.meta.env?.VITE_LOGIN_USERPOOL}/api/v3/signin-by-extidp`;
  const params = {
    client_id: loginParams.value.client_id,
    response_type: loginParams.value.response_type,
    redirect_uri: redirectUri,
    scope: 'openid profile username email street_address phone',
    state: loginParams.value.state,
    nonce: loginParams.value.nonce,
    lang: lang.value === 'zh' ? 'zh-CN' : 'en-US',
    response_mode: 'web_message',
  };
  const connIds: any = {
    Gitee: '6226d91103d81d8654673f1b',
    GitHub: '6226db30c8e30db1518cc4aa',
    OpenAtom: '6607b16cb5fd97506e8cde93',
  };
  Object.assign(params, { ext_idp_conn_id: connIds[type] });
  loginForm.value?.validator('policy').subscribe((valid: boolean) => {
    if (valid) {
      let width = 500;
      const height = 700;
      if (type === 'Gitee') {
        width = 1263;
      }
      windowOpener.value = window.open(
        getUrlByParams(url, params),
        '_blank',
        `width=${width},height=${height},left=${(screen.width - width) / 2},top=${
          (screen.height - height) / 2
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
  {
    key: 'OpenAtom',
    icon: IconOpenAtom,
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
    !ONLY_LOGIN_ID.includes(loginParams.value.client_id as string) &&
    !isWeChat()
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
    <template v-if="showFooter" #footer>
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
  margin-left: var(--o-spacing-h2);
}
.icon {
  font-size: var(--o-font-size-h3);
  cursor: pointer;
}
.app-footer {
  padding-top: var(--o-spacing-h4);
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
