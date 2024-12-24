<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'shared/i18n/index';
import { useCommonData } from 'shared/stores/common';

const i18n = useI18n();
const clickShow = ref(false);
const { lang, loginParams, selectLoginType } = useCommonData();

const closeBox = () => {
clickShow.value = false;
};
const show = () => {
    clickShow.value = true;
};

// 隐私政策、法律声明
const goToOtherPage = (type: string) => {
  const origin = import.meta.env.VITE_OPENEULER_WEBSITE;
  const url = `${origin}/${lang.value}/other/${type}`;
  window.open(url, '_blank');
};

defineExpose({ show });
</script>

<template>
  <div v-if="clickShow" class="mask" @touchstart.prevent="() => {}">
    <div
      class="verifybox"
    >
      <div class="title">
        {{ i18n.SIGN_PRIVACY_STATEMENT }}
        <span class="close" @click="closeBox" @touchstart.prevent="closeBox">
          <i class="iconfont icon-close"></i>
        </span>
      </div>
      <div class="content">
        <span class="cursor">
          {{ i18n.PLEASE_AGREE_FIRST }}
        </span>
        <span>&nbsp;</span>
        <a @click="goToOtherPage('privacy')">{{ i18n.PRIVACY_POLICY }}</a>
        {{ i18n.AND }}
        <a @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</a>
      </div>
      <div
        class="bottom"
        style="padding: 15px"
      >
      </div>
    </div>
  </div>
</template>

<style>
  .verifybox {
    position: relative;
    box-sizing: border-box;
    border-radius: 2px;
    border: 1px solid #e4e7eb;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .title {
    padding: 0 15px;
    height: 50px;
    line-height: 50px;
    text-align: left;
    font-size: 16px;
    color: #45494c;
    border-bottom: 1px solid #e4e7eb;
    box-sizing: border-box;
  }
  .bottom {
    padding: 15px;
    box-sizing: border-box;
  }
  .close {
    position: absolute;
    top: 13px;
    right: 9px;
    width: 24px;
    height: 24px;
    text-align: center;
    cursor: pointer;
  }
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10001;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
    /* display: none; */
    transition: all 0.2s;
    touch-action: none;
    touch-action: pan-y;
  }

  .iconfont {
    font-family: 'iconfont' !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .icon-close:before {
    content: ' ';
    display: block;
    width: 32px;
    height: 32px;
    position: absolute;
    margin: auto;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 9999;
    background-image: url('../svg-icons/icon-cancel.svg');
    background-size: contain;
  }
  
  .icon-right:before {
    content: ' ';
    display: block;
    width: 32px;
    height: 32px;
    position: absolute;
    margin: auto;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-size: cover;
    z-index: 9999;
    background-image: url('../svg-icons/icon-chevron-right.svg');
    background-size: contain;
  }
  
</style>
  