<script setup lang="ts"></script>
<template>
  <div class="all">
    <div class="main">
      <div class="app-header">
        <div class="header-title">
          <slot name="headerTitle"></slot>
        </div>
      </div>
      <div class="app-body">
        <slot name="body"></slot>
      </div>
      <div class="switch">
        <slot name="switch"></slot>
      </div>
      <slot name="footer"></slot>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.all {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-color: var(--o-color-fill1);
}
.main {
  width: 480px;
  margin: 0 auto;
  border-radius: 16px;
  padding: 48px 80px;
  background-color: var(--o-color-fill2);
  box-shadow: var(--o-shadow-1);
}

.app-header {
  display: flex;
  justify-content: center;

  .header-title {
    @include h1;
    font-weight: 600;
    color: var(--o-color-info1);
  }
}
.app-body {
  padding-top: 24px;
}
.switch {
  display: flex;
  justify-content: center;
  @include tip1;
}
:deep(.o-link-normal) {
    --link-color: var(--o-color-link1);
    --link-color-hover: var(--o-color-link2);
    --link-color-active: var(--o-color-link3);
}
</style>
