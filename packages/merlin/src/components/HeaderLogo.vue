<script setup lang="ts">
import { OTag } from '@opensig/opendesign';
import logo from '@/assets/logo1.svg';

const goHome = () => {
  location.href = `${import.meta.env.VITE_OPENEULER_WEBSITE}/`;
};
</script>

<template>
  <div class="header-logo">
    <img class="logo" alt="openMind" :src="logo" @click="goHome" />
    <OTag variant="outline" size="small" class="logo-tag">Beta</OTag>
  </div>
</template>

<style lang="scss" scoped>
.logo {
  height: 48px;

  @include respond-to('<=pad') {
    height: 30px;
  }
}
.logo-tag {
  margin-top: -16px;
  cursor: default;
  @include respond-to('<=pad') {
    margin-top: -8px;
    --tag-height: 12px;
    --tag-text-size: 10px;
    --tag-padding: 0 2px;
  }
}
</style>
