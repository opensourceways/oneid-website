<script lang="ts" setup></script>

<template>
  <div class="login-card">
    <div class="card">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-card {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-color: var(--o-color-bg1);
  background-image: url(../../../assets/login_background.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: left;
  .card {
    width: 420px;
    margin: 0 auto;
    padding: var(--o-spacing-h2);
    background-color: var(--o-color-text2);
    box-shadow: var(--o-shadow-l1);
  }
}
:root.dark {
  .login-card {
    background-image: url(../../../assets/login_background_dark.jpg);
  }
}
</style>
