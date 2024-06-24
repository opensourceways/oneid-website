<script setup lang="ts">

import logo from '@/assets/logo1.svg';

const goHome = () => {
  location.href = `${import.meta.env.VITE_OPENEULER_WEBSITE}/`;
};
</script>

<template>
  <div class="header-logo">
    <img class="logo" alt="openMind" :src="logo" @click="goHome" />
  </div>
</template>

<style lang="scss" scoped>
.logo {
  height: 48px;

  @include respond-to('<=pad') {
    height: 30px;
  }
}
</style>
