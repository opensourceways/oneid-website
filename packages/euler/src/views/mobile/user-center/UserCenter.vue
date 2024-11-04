<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import UserLeftTree from './components/UserLeftTree.vue';
import { SelectTabKey } from 'shared/@types/usercenter.interface';
import { onMounted, ref } from 'vue';
import { useCommon } from 'shared/stores/common';
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
  </div>
</template>
<style lang="scss" scoped>
.banner {
  width: 100%;
  height: 126px;
  background-image: url('@/assets/banner_mobile.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: left;
  .title {
    padding: 0 var(--o-spacing-h6);
    position: relative;
    &-in {
      position: absolute;
      top: 38px;
      font-size: 24px;
      font-weight: bold;
      color: rgba(0, 47, 167, 0.14);
      line-height: 34px;
    }
    &-out {
      position: absolute;
      top: 28px;
      font-size: 18px;
      font-weight: 500;
      color: var(--o-color-white);
      line-height: 76px;
    }
  }
}
.main {
  padding: var(--o-spacing-h3) var(--o-spacing-h5);
  margin: 0 auto;
  max-width: 1472px;
  grid-template-columns: 33.9% 66.1%;
}
</style>
