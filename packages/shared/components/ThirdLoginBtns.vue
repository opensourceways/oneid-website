<script setup lang="ts">
import IconGithub from '~icons/app/icon-github.svg';
import IconGitee from '~icons/app/icon-gitee.svg';
import { useCommonData } from '../stores/common';
import useThirdParty from '../composables/useThirdParty';
import { onMounted, ref } from 'vue';
import { useI18n } from '../i18n';
import { getThirdpartyList } from '../api/api-thirdparty';
import { ElMessage } from 'element-plus';
import { haveLoggedIn } from '../utils/login-success';

const i18n = useI18n();
const { loginParams } = useCommonData();

const loginFun = () => {
  ElMessage.success({
    showClose: true,
    message: i18n.value.LOGIN_SUCCESS,
  });
  haveLoggedIn();
};
const thirdParty = useThirdParty({
  success: loginFun,
})

const icons = [
  {
    key: 'gitee',
    icon: IconGitee,
  },
  {
    key: 'github',
    icon: IconGithub,
  },
];
const iconlist = ref<any[]>([]);
const queryThirdList = () => {
  getThirdpartyList({ client_id: loginParams.value.client_id as string }).then(
    (res) => {
      const { data = {} } = res;
      iconlist.value = icons.reduce((pre, next) => {
        if (data?.[next.key]) {
          pre.push(Object.assign(next, { connection_id: data?.[next.key] }));
        }
        return pre;
      }, [] as any);
    }
  );
};

const threePartsLogin = (data: any) => {
  thirdParty.login(data);
};

onMounted(() => {
  queryThirdList();
});

const emits = defineEmits(['thirdLogin']);
const thirdLogin = (data: any) => {
  emits('thirdLogin', threePartsLogin.bind(null, data));
};
</script>
<template>
  <div class="third-login" v-if="iconlist.length">
    <div class="divider">
      <div class="line"></div>
      <div class="other">{{ i18n.THREE_PART_LOGIN }}</div>
      <div class="line"></div>
    </div>
    <div class="three-parts">
      <div
        v-for="(item, index) in iconlist"
        :key="item.key"
        @click="thirdLogin(item)"
      >
        <OIcon class="icon" :class="{ gap: index }">
          <component :is="item.icon"></component>
        </OIcon>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.third-login {
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
  .gap {
    margin-left: var(--o-spacing-h2);
  }
  .icon {
    font-size: var(--o-font-size-h3);
    cursor: pointer;
  }
}
</style>
