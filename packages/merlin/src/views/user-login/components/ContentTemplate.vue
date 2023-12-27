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
  padding: var(--o-spacing-h2);
  background-color: var(--o-color-text2);
  box-shadow: var(--o-shadow-l1);
}

.app-header {
  display: flex;
  justify-content: center;

  .header-title {
    font-size: var(--o-font-size-h5);
    line-height: var(--o-line-height-h5);
    color: var(--o-color-text1);
  }
}
.app-body {
  padding-top: var(--o-spacing-h4);
}
.switch {
  display: flex;
  justify-content: end;
  font-size: var(--o-font-size-text);
  line-height: var(--o-line-height-text);
}
</style>
