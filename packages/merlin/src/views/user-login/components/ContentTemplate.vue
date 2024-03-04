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
  background-color: rgb(247, 247, 247);
}
.main {
  width: 420px;
  margin: 0 auto;
  padding: 40px;
  background-color: var(--o-color-fill2);
  box-shadow: var(--o-shadow-1);
}

.app-header {
  display: flex;
  justify-content: center;

  .header-title {
    @include h2;
    color: var(--o-color-info1);
  }
}
.app-body {
  padding-top: 24px;
}
.switch {
  display: flex;
  justify-content: end;
  @include tip1;
}
</style>
