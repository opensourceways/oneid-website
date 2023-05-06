<script setup lang="ts">
import IconGithub from '~icons/app/icon-github.svg';
import IconGitee from '~icons/app/icon-gitee.svg';
import IconOpenAtom from '~icons/app/icon-openatom.svg';
import ContentTemplate from './ContentTemplate.vue';
import LoginForm from './LoginForm.vue';
import { onMounted, onUnmounted, PropType, ref, toRefs } from 'vue';
import { useI18n } from 'shared/i18n';
import { getUrlByParams } from 'shared/utils/utils';
import { useCommonData } from 'shared/stores/common';

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
onMounted(() => {
  listenerThreePartsLogin();
});
onUnmounted(() => {
  // 移除监听
  window.removeEventListener('message', loginFun);
});
const loginForm = ref();

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
  // {
  //   key: 'OpenAtom',
  //   icon: IconOpenAtom,
  //   onClick: (type: string) => {
  //   threePartsLogin(type);
  // },
  // },
];

// 三方登录
const redirect_uri = `${import.meta.env.VITE_LOGIN_ORIGIN}/login`;
const threePartsLogin = (type: string) => {
  const url = 'https://api.authing.cn/api/v3/signin-by-extidp';
  const params = {
    client_id: loginParams.value.client_id,
    response_type: loginParams.value.response_type,
    redirect_uri,
    scope: 'openid profile username email',
    state: loginParams.value.state,
    nonce: loginParams.value.nonce,
    lang: lang.value === 'zh' ? 'zh-CN' : 'en-US',
    response_mode: 'web_message',
  };
  const ext_idp_conn_id: any = {
    Gitee: '6226d91103d81d8654673f1b',
    GitHub: '6226db30c8e30db1518cc4aa',
    OpenAtom: '63c0bfd4c88ee67bcf1959b4',
  };
  Object.assign(params, { ext_idp_conn_id: ext_idp_conn_id[type] });
  loginForm.value?.validator('policy').subscribe((valid: boolean) => {
    if (valid) {
      window.open(
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

// 监听三方登录结果
const listenerThreePartsLogin = () => {
  window.addEventListener('message', loginFun);
};
const loginFun = (e: MessageEvent) => {
  const { type, response } = e.data;
  if (type !== 'authorization_response') {
    return;
  }
  const { code, state } = response;
  if (code && state) {
    const param = {
      code,
      redirect_uri,
    };
    emit('threePartLogin', param);
  }
};

const submit = (form: any) => {
  emit('submit', form);
};
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
    <template v-if="type !== 'register'" #footer>
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
