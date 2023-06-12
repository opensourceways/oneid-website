<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import UserLeftTree from './components/UserLeftTree.vue';
import { SelectTabKey } from './components/interface';
import { onMounted, ref } from 'vue';
import { useCommon } from 'shared/stores/common';
import { getCommunityParams } from '@/shared/utils';

const i18n = useI18n();
const selected = ref('userinfo' as SelectTabKey);

// token传入
const store = useCommon();

onMounted(() => {
  store.initUserInfo(getCommunityParams(true));
});
</script>
<template>
  <div class="img_box">
    <div class="title">
      <h1 class="title-out">{{ i18n.USER_CENTER }}</h1>
      <img class="title-login" src="@/assets/login_log.png" />
    </div>
  </div>
  <div class="main">
    <div class="left">
      <UserLeftTree v-model="selected"></UserLeftTree>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.img_box {
  width: 100%;
  height: 100px;
  background-image: url('@/assets/banner.png');
  background-size: cover;
  background-repeat: no-repeat;
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
      line-height: 34px;
    }
    &-out {
      position: absolute;
      top: 35px;
      font-size: 24px;
      font-weight: 300;
      color: var(--o-color-white);
      line-height: 30px;
    }
    &-login {
      position: absolute;
      top: 20px;
      right: 0;
      margin-right: var(--o-spacing-h6);
      width: 90px;
      height: 60px;
    }
  }
}
.main {
  padding: var(--o-spacing-h3) var(--o-spacing-h5);
  margin: 0 auto;
  max-width: 1472px;
}
</style>
