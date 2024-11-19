<script lang="ts" setup>
import logo from '@/assets/logo.png';
</script>

<template>
  <div class="login-card">
    <div class="card">
      <div class="logo">
        <img alt="openMind" :src="logo" />
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-card {
  width: 100%;
  height: 100%;
  min-height: inherit;
  display: flex;
  align-items: center;
  // background-color: var(--o-color-fill1);
  padding-top: 16px;
  padding-bottom: 16px;
  .card {
    width: 480px;
    margin: 0 auto;
    border-radius: 8px;
    padding: 26px 80px 36px;
    background-color: var(--o-color-fill2);
    box-shadow: var(--o-shadow-1);
    @include respond-to('phone') {
      padding: 24px;
      background-color: var(--o-color-fill1);
      box-shadow: none;
      height: calc(var(--layout-content-min-height) - 32px);
      display: flex;
      flex-direction: column;
    }
    .logo {
      text-align: center;
      margin-bottom: 16px;
      img {
        height: 48px;
      }
    }
  }
}
</style>
