<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted, watch } from 'vue';
import { useCommon, useCommonData } from 'shared/stores/common';
import { useI18n } from 'shared/i18n';
import {
  showGuard,
  logout,
  useStoreData,
  getUserAuth,
  refreshInfo,
} from 'shared/utils/login';
import AppTheme from 'shared/components/AppTheme.vue';
import AppLanguage from 'shared/components/AppLanguage.vue';

import logoLight from '@/assets/logo.svg';
import logoDark from '@/assets/logo_dark.svg';

import IconCancel from '~icons/app/icon-cancel.svg';
import IconMenu from '~icons/app/icon-menu.svg';
import IconLogin from '~icons/app/icon-login.svg';
import { testIsPhone } from 'shared/utils/helper';
import { useRouter } from 'vue-router';
const router = useRouter();

interface NavItem {
  NAME: string;
  PATH: string;
  ID: string;
  CHILDREN: NavItem;
  TEST_PATH?: string;
  IS_OPEN_WINDOW?: number;
  IS_OPEN_MINISITE_WINDOW?: string;
}

const { token } = getUserAuth();
const { guardAuthClient } = useStoreData();

const { lang } = useCommonData();
const i18n = useI18n();
const commonStore = useCommon();
const documentElement = document.documentElement;

const toBody = ref(false);

const logo = computed(() =>
  commonStore.theme === 'light' ? logoLight : logoDark
);

// 移动菜单事件
const mobileMenuIcon = ref(false);
const mobileChildMenu = ref<NavItem | any>([]);

const mobileMenuPanel = () => {
  mobileChildMenu.value = [];
  toBody.value = true;
  setTimeout(() => {
    mobileMenuIcon.value = !mobileMenuIcon.value;
    documentElement.classList.toggle('overflow');
  }, 200);
};

const handleMenuLayer = (e: any) => {
  if (e.target.className !== 'mobile-menu-side') {
    if (mobileChildMenu.value.length === 0) {
      mobileMenuIcon.value = false;
      documentElement.classList.remove('overflow');
    }
  }
};

const langShow = ref(['zh', 'en'] as any);

onMounted(() => {
  toBody.value = true;
});
onUnmounted(() => {
  toBody.value = false;
});

// 返回首页
const goHome = () => {
  const origin = import.meta.env.VITE_OPENEULER_WEBSITE;
  location.href = `${origin}/${lang.value}/`;
};
// 跳转到消息中心
const goMessageCenter = () => {
  location.href = import.meta.env.VITE_OPENEULER_MESSAGE_CENTER;
};
// 判断移动端
const isMobile = () => {
  if (testIsPhone()) {
    refreshInfo();
    const Lang =
      lang.value === 'zh' ? '/zh/mobile/profile' : '/en/mobile/profile';
    if (!window.location.pathname.includes(Lang)) {
      router.push(Lang);
    }
  }
};
isMobile();
watch(
  () => guardAuthClient.value,
  () => {
    if (
      testIsPhone() &&
      !token &&
      !guardAuthClient.value.username &&
      !guardAuthClient.value.photo
    ) {
      const Lang =
        lang.value === 'zh' ? '/zh/mobile/profile' : '/en/mobile/profile';
      router.push(Lang);
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
</script>

<template>
  <header class="app-header">
    <div class="app-header-body">
      <!-- 移动端菜单图标 -->
      <div class="mobile-menu-icon">
        <OIcon v-if="!mobileMenuIcon" class="icon" @click="mobileMenuPanel">
          <IconMenu />
        </OIcon>
        <OIcon v-else class="icon" @click="mobileMenuPanel"
          ><IconCancel
        /></OIcon>
      </div>
      <img class="logo" alt="openEuler logo" :src="logo" @click="goHome" />
      <div
        v-if="toBody"
        class="mobile-menu"
        :class="{ active: mobileMenuIcon }"
        @click="handleMenuLayer($event)"
      >
        <div class="mobile-menu-side">
          <div class="mobile-tools">
            <AppTheme />
            <AppLanguage
              :show="langShow"
              @language-click="mobileMenuIcon = false"
            />
          </div>
        </div>
      </div>
      <div style="flex: 1"></div>
      <div class="header-content">
        <div class="header-tool">
          <!-- 中英文切换 -->
          <AppLanguage :show="langShow" />
          <AppTheme />
        </div>
      </div>
      <div class="opt-user">
        <div v-if="token">
          <div class="el-dropdown-link opt-info">
            <img
              v-if="guardAuthClient.photo"
              :src="guardAuthClient.photo"
              class="img"
            />
            <div v-else class="img"></div>
            <p class="opt-name">{{ guardAuthClient.username }}</p>
          </div>
          <ul class="menu-list">
            <!-- <li @click="jumpToUserZone()">{{ i18n.common.USER_CENTER }}</li> -->
            <li @click="goMessageCenter">{{ i18n.MESSAGE_CENTER }}</li>
            <li @click="logout()">{{ i18n.LOGOUT }}</li>
          </ul>
        </div>
        <div v-else class="login" @click="showGuard()">
          <OIcon class="icon">
            <IconLogin />
          </OIcon>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  background-color: var(--o-color-bg2);
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 99;
  box-shadow: var(--o-shadow-l1);
  &-body {
    display: flex;
    align-items: center;
    max-width: 1504px;
    padding: 0 44px;
    margin: 0 auto;
    height: 80px;
    @media (max-width: 1439px) {
      padding: 0 24px;
    }
    @media (max-width: 1100px) {
      padding: 0 16px;
      height: 48px;
      justify-content: space-between;
      position: relative;
    }
  }
}
.logo {
  height: 32px;
  cursor: pointer;
  margin-right: var(--o-spacing-h4);
  @media (max-width: 1100px) {
    height: 24px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 12px;
    margin-right: 0;
  }
}
.mobile-menu-icon {
  display: none;
  margin-right: var(--o-spacing-h5);
  @media (max-width: 1100px) {
    flex: 1;
    display: block;
  }
  .icon {
    font-size: var(--o-font-size-h6);
    color: var(--o-color-text1);
    cursor: pointer;
  }
}
.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  @media screen and (max-width: 1100px) {
    display: none;
  }
  .header-tool {
    display: grid;
    gap: 20px;
    grid-template-columns: auto auto auto;
    align-items: center;
    height: 100%;
    .lang {
      color: var(--o-color-text1);
      letter-spacing: 0.08em;
      font-size: 16px;
    }
  }
  .icon {
    font-size: 22px;
    color: var(--o-color-text1);
  }
}

.dark {
  .drawer {
    background: rgba($color: #2e2e2e, $alpha: 0.9);
    @media screen and (max-width: 1439px) {
      background: rgba($color: #2e2e2e, $alpha: 1);
    }
  }
}

.mobile-menu {
  width: 100%;
  position: fixed;
  left: 0;
  // transition: all 0.3s linear;
  overflow: hidden;
  display: flex;
  opacity: 0;
  visibility: hidden;
  border-top: 1px solid var(--o-color-division);
  background: rgba(0, 0, 0, 0.4);
  top: 48px;
  height: calc(100% - 48px);
  z-index: 999;
  @media screen and (min-width: 1100px) {
    display: none;
  }

  &.active {
    opacity: 1;
    z-index: 1101;
    display: flex;
    visibility: visible;
    @media screen and (min-width: 1100px) {
      opacity: 0;
    }

    .mobile-menu-side {
      left: 0;
      opacity: 1;
      z-index: 9;
    }
  }
  &-side {
    left: -100%;
    background: var(--o-color-bg1);
    display: inline-flex;
    height: 100%;
    flex-direction: column;
    color: var(--o-color-text1);
    min-width: 164px;
    opacity: 0;
    position: relative;
    transition: all 0.3s linear;
    overflow-y: auto;
    justify-content: space-between;
    &::-webkit-scrollbar-track {
      border-radius: 10px;
      background-color: #f1f1f1;
    }
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: #afbfe8;
    }
    .mobile-tools {
      padding: 0 var(--o-spacing-h5);
      margin-bottom: 24px;
    }
  }
}

// transition 动画
.menu-sub-enter-active,
.menu-sub-leave-active {
  transition: 0.5s linear;
  left: -100%;
}
.menu-sub-leave-active {
  transition: 0.3s linear;
}
.menu-sub-enter,
.menu-sub-leave-to {
  opacity: 0;
}
.menu-sub-enter-to {
  opacity: 1;
  left: 0%;
}
.menu-sub-leave {
  opacity: 1;
  left: -100%;
}
.opt-user {
  margin-left: 8px;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  .opt-info {
    display: flex;
    align-items: center;
    .img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      vertical-align: middle;
      @media (max-width: 1100px) {
        width: 28px;
        height: 28px;
      }
    }
    .opt-name {
      color: var(--o-color-text1);
      margin-left: 8px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 72px;
      line-height: var(--o-line-height-h8);
      @media (max-width: 1100px) {
        display: none;
      }
    }
  }
  &:hover {
    .menu-list {
      display: block;
    }
  }
  .menu-list {
    display: none;
    position: absolute;
    top: 80px;
    left: 0;
    @media (max-width: 1100px) {
      top: 48px;
      left: -60px;
    }
    background: var(--o-color-bg2);
    cursor: pointer;
    z-index: 999;
    box-shadow: var(--o-shadow-l1);
    min-width: 78px;
    white-space: nowrap;
    li {
      line-height: var(--o-line-height-h3);
      text-align: center;
      font-size: var(--o-font-size-text);
      color: var(--o-color-text1);
      border-bottom: 1px solid var(--o-color-division1);
      padding: 0 var(--o-spacing-h5);
      &:last-child {
        border-bottom: 0 none;
      }

      &:hover {
        background: var(--o-color-brand1);
        color: var(--o-color-white);
      }
      &.active {
        color: var(--o-color-brand1);
        background: none;
        cursor: default;
      }
    }
  }
}
.login {
  .icon {
    font-size: var(--o-font-size-h6);
    color: var(--o-color-text1);
    cursor: pointer;
  }
}
</style>
