<script setup lang="ts">
/**
  因送检需要以及xihe有自己的个人中心且不支持注销账号，现需要删除mindspore-usercenter个人中心相关内容
  个人中心内容备份至分支save_mindspore_usercenter_20230717，方便后续找回
*/
import UserCenter from './UserCenter.vue';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import NotFound from '@/components/NotFound.vue';
import { getUserAuth, refreshInfo, showGuard } from 'shared/utils/login';
import { useI18n } from 'shared/i18n';

refreshInfo();
const { token } = getUserAuth();
const i18n = useI18n();
</script>

<template>
  <AppHeader />
  <main>
    <NotFound v-if="!token">
      <template #title>
        <p>
          {{ i18n.PLEASE }}
          <a @click="showGuard()">{{ i18n.LOGIN }}</a> !
        </p>
      </template>
    </NotFound>
    <UserCenter v-else></UserCenter>
  </main>
  <AppFooter />
</template>

<style lang="scss" scoped>
main {
  position: relative;
  min-height: calc(100vh - 280px);
  background-color: var(--o-color-bg1);
  margin-top: 80px;
  overflow: hidden;

  @media (max-width: 1100px) {
    margin-top: 48px;
  }
}
</style>
