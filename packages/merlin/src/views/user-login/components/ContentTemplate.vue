<script setup lang="ts">
import LoginLanguage from 'shared/components/LoginLanguage.vue';
import LoginCard from './LoginCard.vue';
</script>
<template>
  <LoginCard>
    <div class="app-header">
      <div class="header-title">
        <slot name="headerTitle"></slot>
      </div>
      <div class="header-title-tip">
        <slot name="headerTitleTip"></slot>
      </div>
    </div>
    <div class="app-body">
      <slot name="body"></slot>
    </div>
    <div class="switch">
      <slot name="switch"></slot>
    </div>
    <slot name="footer"></slot>
    <LoginLanguage></LoginLanguage>
  </LoginCard>
</template>
<style lang="scss" scoped>

.app-header {
  display: flex;
  flex-direction: column;

  .header-title {
    @include h2;
    font-weight: 600;
    text-align: center;
    color: var(--o-color-info1);
  }
  .header-title-tip {
    margin-top: 12px;
    font-size: 14px;
    color: rgba(0,0,0,0.60);
    letter-spacing: 0;
    line-height: 22px;
    font-family: PingFangSc;
    font-weight: Regular;
  }
  
}
.app-body {
  padding-top: 24px;
}
.switch {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  height: 22px;
  @include respond-to('phone') {
    flex-grow: 1;
    align-items: start;
  }
}
</style>
