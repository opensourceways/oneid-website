<script setup lang="ts"></script>

<template>
  <div class="nofound">
    <img src="@/assets/empty.svg" class="nofound-img" />
    <p class="nofound-text">
      <slot name="title"> 回调地址redirect_uri不匹配 </slot>
    </p>
  </div>
</template>

<style lang="scss" scoped>
.nofound {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  @include h4;
  color: var(--o-color-info1);
  height: inherit;
  background-color: rgb(247, 247, 247);
  min-height: calc(100vh - 339px);
  .nofound-text {
    margin-top: var(--o-spacing-h5);
  }
  .nofound-img {
    height: 300px;
  }
  @media screen and (max-width: 768px) {
    .nofound-img {
      max-height: 232px;
    }
    .nofound-text {
      margin-top: var(--o-spacing-h6);
    }
  }
}
</style>
