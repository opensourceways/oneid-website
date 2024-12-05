<script setup lang="ts">
import IconGithub from '~icons/app/icon-github.svg';
import IconGitee from '~icons/app/icon-gitee.svg';
import ContentTemplate from './ContentTemplate.vue';
import LoginForm from './LoginForm.vue';
import { PropType, ref, toRefs, computed, onMounted, onUnmounted } from 'vue';
import { getUrlByParams, isWeChat, setSessionStorage } from 'shared/utils/utils';
import { useCommonData } from 'shared/stores/common';
import { useI18n } from 'shared/i18n';
import { ONLY_LOGIN_ID } from '@/shared/const';
import { haveLoggedIn } from 'shared/utils/login-success';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});
// 和环境变量里三方登录的type类型对应
type ThreeLoginTypeT = 'Github' | 'Gitee';
type threeLoginIconMapT = {
  Github?: any;
  Gitee?: any;
};
const threeLoginIconMap: threeLoginIconMapT = {
  Github: IconGithub,
  Gitee: IconGitee,
};

const loginForm = ref();
const emit = defineEmits(['submit']);

const { type } = toRefs(props);
const i18n = useI18n();
const { loginParams } = useCommonData();
const submit = (form: any) => {
  emit('submit', form);
};
// 三方登录
const windowOpener = ref();

const threePartsLogin = (item: ICONS_OBJ_T) => {
  const url = `/oneid/third-party/authorize`;
  const params = {
    client_id: loginParams.value.client_id,
    connection_id: item.id,
    t: new Date().getTime(),
  };
  setSessionStorage('TP_PARAM', JSON.stringify(params));
  loginForm.value?.validator('policy').subscribe((valid: boolean) => {
    if (valid) {
      let width = 500;
      const height = 700;
      if (item.key === 'Gitee') {
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

type ICONS_OBJ_T = {
  key: ThreeLoginTypeT;
  id: string;
  icon: any;
  onClick: (obj: ICONS_OBJ_T) => void;
};
const threeLoginTypes =
  import.meta.env?.VITE_THREE_LOGIN_TYPE?.split(',') ||
  ([] as ThreeLoginTypeT[]);
const threeLoginIds = import.meta.env?.VITE_THREE_LOGIN_ID?.split(',') || [];
const icons: ICONS_OBJ_T[] = threeLoginTypes.map(
  (one: ThreeLoginTypeT, index: number) => {
    return {
      key: one,
      icon: threeLoginIconMap[one],
      id: threeLoginIds[index],
      onClick: (obj: ICONS_OBJ_T) => {
        threePartsLogin(obj);
      },
    };
  }
);

const showFooter = computed(
  () =>
    type.value === 'login' &&
    !ONLY_LOGIN_ID.includes(loginParams.value.client_id as string) &&
    !isWeChat()
);

const loginFun = (e: MessageEvent) => {
  const { type, response } = e.data;
  if (type !== 'authorization_response') {
    return;
  }
  if (response === 'success') {
    windowOpener.value?.close();
    haveLoggedIn();
  }
};
// 监听三方登录结果
const listenerThreePartsLogin = () => {
  window.addEventListener('message', loginFun);
};
onMounted(() => {
  listenerThreePartsLogin();
});
onUnmounted(() => {
  // 移除监听
  window.removeEventListener('message', loginFun);
});
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
            @click="item.onClick(item)"
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
