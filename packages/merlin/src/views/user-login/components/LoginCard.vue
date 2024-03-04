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
  background-color: rgb(247, 247, 247);
  .card {
    width: 420px;
    margin: 0 auto;
    padding: 40px;
    background-color: var(--o-color-fill2);
    box-shadow: var(--o-shadow-1);
  }
}
</style>
