<script setup lang="ts">
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
  min-height: calc(100vh - 339px);
  background-color: var(--o-color-bg1);
  margin-top: 80px;
  overflow: hidden;

  @media (max-width: 1100px) {
    margin-top: 48px;
  }
}
</style>
