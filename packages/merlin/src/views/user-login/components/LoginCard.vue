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
  background-color: var(--o-color-fill1);
  .card {
    width: 480px;
    margin: 0 auto;
    border-radius: 16px;
    padding: 48px 80px;
    background-color: var(--o-color-fill2);
    box-shadow: var(--o-shadow-1);
  }
}
</style>
