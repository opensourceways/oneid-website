<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import UserLeftTree from './components/UserLeftTree.vue';
import UserInfo from './components/UserInfo.vue';
import AccountBinding from './components/AccountBinding.vue';
import AccountSecurity from './components/AccountSecurity.vue';
import { SelectTabKey } from 'shared/@types/usercenter.interface';
import { onMounted, ref } from 'vue';
import { useCommon } from 'shared/stores/common';

type ComponentKey<T = any> = {
  [key in SelectTabKey]: T;
};

const componentSelected: ComponentKey = {
  userinfo: UserInfo,
  binding: AccountBinding,
  security: AccountSecurity,
};
const i18n = useI18n();
const selected = ref('userinfo' as SelectTabKey);

// token传入
const store = useCommon();

onMounted(() => {
  store.initUserInfo();
});
</script>
<template>
  <div class="banner">
    <div class="title">
      <h1 class="title-in">USER CENTER</h1>
      <h1 class="title-out">{{ i18n.USER_CENTER }}</h1>
    </div>
  </div>
  <div class="main">
    <div class="left">
      <UserLeftTree v-model="selected"></UserLeftTree>
    </div>
    <div class="right">
      <component :is="componentSelected[selected]"></component>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.banner {
  width: 100%;
  height: 280px;
  background-image: url('../../assets/banner.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: left;
  .title {
    margin: 0 auto;
    max-width: 1472px;
    padding: 0 var(--o-spacing-h6);
    position: relative;
    &-in {
      position: absolute;
      top: 60px;
      font-size: 68px;
      font-weight: bold;
      color: rgba(0, 47, 167, 0.14);
      line-height: 84px;
    }
    &-out {
      position: absolute;
      top: 92px;
      font-size: 54px;
      font-weight: 500;
      color: var(--o-color-white);
      line-height: 76px;
    }
  }
}
.main {
  padding: var(--o-spacing-h1) var(--o-spacing-h5);
  margin: 0 auto;
  max-width: 1472px;
  display: grid;
  grid-template-columns: 33.9% 66.1%;
  min-height: 963px;
  .left {
    padding-right: var(--o-spacing-h4);
  }
}
</style>
