<script lang="ts" setup>
import { ref, Ref, watch } from 'vue';

import IconDown from '~icons/app/icon-chevron-down.svg';
import { useCommon, useCommonData } from 'shared/stores/common';
import { useRouter } from 'vue-router';

const props = defineProps({
  show: {
    type: Object,
    default() {
      return [];
    },
  },
});

const router = useRouter();
const { changeLang } = useCommon();
const { lang } = useCommonData();

// 选择语言;
const langOptions = [
  { id: 'zh', label: '简体中文' },
  { id: 'en', label: 'English' },
];

// 选择语言
const emits = defineEmits(['language-click']);

const isMenu = ref(false);

function chaneLanguage(newlang: string) {
  if (lang.value === newlang) return;
  const { pathname } = window.location;
  if (pathname.includes(`${lang.value}`)) {
    // 原有的代码逻辑
    changePathLang(newlang);
  } else {
    // 对search上的lang进行处理
    changeSearchLang(newlang);
  }
}
function changePathLang(newlang: string) {
  const { pathname, host, search } = window.location;
  const newHref = pathname.replace(`/${lang.value}/`, `/${newlang}/`);
  const RU = 'ru';
  isMenu.value = false;
  // 判断是否是ru
  if (host.includes(RU) || newlang === RU) {
    window.open(
      `https://${newlang === RU ? RU : 'www'}.openeuler.org` + newHref + search,
      '_self'
    );
  } else {
    router.push(newHref + search);
  }
}
// 对search上的lang进行处理
function changeSearchLang(newlang: string) {
  changeLang(newlang);
  // 改变url上的lang显示
  const url = new URL(window.location.href);
  url.searchParams.set('lang', newlang);
  location.href = url.toString();
}

const mobileChaneLanguage = (newlang: string) => {
  chaneLanguage(newlang);
  emits('language-click');
};

let timer: number = 0;
const showSub = () => {
  if (timer) {
    clearTimeout(timer)
  } 
  isMenu.value = true;
};
// 增加延时，处理鼠标移动到语言选择菜单前菜单高频消失问题
const hideSub = () => {
  timer = window.setTimeout(() => {
    isMenu.value = false;
  }, 100)
};

interface LangType {
  id: string;
  label: string;
}
const langList: Ref<LangType[]> = ref([]);
const filterLang = () => {
  langList.value = [];
  props.show.forEach((item: string) => {
    langOptions.forEach((el: LangType) => {
      if (el.id === item) {
        langList.value.push(el);
      }
    });
  });
};

watch(
  () => props.show,
  () => {
    filterLang();
  },
  { immediate: true }
);
</script>

<template>
  <div class="lang-menu" @mouseenter="showSub()" @mouseleave="hideSub()">
    <span class="lang-menu-link" :class="{ 'no-state': langList.length < 2 }">
      {{ lang === 'zh' ? '中文' : 'EN' }}
      <OIcon
        v-if="langList.length > 1"
        class="ml4"
        :class="{ rotate180: isMenu }"
        ><icon-down></icon-down
      ></OIcon>
    </span>
    <ul v-show="isMenu && langList.length > 1" class="lang-menu-list">
      <template v-for="item in langList" :key="item.id">
        <li
          class="lang-item"
          :class="{ active: lang === item.id }"
          @click="chaneLanguage(item.id)"
        >
          {{ item.label }}
        </li>
        <hr class="line"/>
      </template>
    </ul>
  </div>
  <div class="mobile-change-language">
    <span
      v-for="item in langList"
      :key="item.id"
      :class="{ active: lang === item.id }"
      @click.stop="mobileChaneLanguage(item.id)"
      >{{ item.label }}</span
    >
  </div>
</template>

<style lang="scss" scoped>
.lang-menu {
  position: relative;
  height: 100%;
  &-link {
    display: flex;
    align-items: center;
    font-size: var(--o-font-size-text);
    color: var(--o-color-text1);
    cursor: pointer;
    height: 100%;
    &.no-state {
      cursor: default;
    }
    .rotate180 {
      transition: transform 0.3s ease-in-out;
      transform: rotateZ(-180deg);
    }
  }
  &-list {
    position: absolute;
    top: 68px;
    left: -50px;
    background: var(--o-color-bg2);
    cursor: pointer;
    z-index: 999;
    box-shadow: var(--o-shadow-l1);
    min-width: 78px;
    width: 144px;
    padding: 4px;
    border-radius: 8px;
    .lang-item {
      line-height: var(--o-line-height-h3);
      text-align: center;
      font-size: var(--o-font-size-h8);
      color: var(--o-color-text1);
      padding: 0 var(--o-spacing-h5);
      &:last-child {
        border-bottom: 0 none;
      }
      &:hover {
        background-color: #edeff2;
        border-radius: 4px;
        color: rgba(0,0,0,0.8);
      }
      &.active {
        color: var(--o-color-brand1);
        background: none;
        cursor: default;
      }
    }
    .line {
      background-color: rgba(0, 0, 0, 0.1);
      margin: 2px;
      height: 1px;
      border: none;
      &:last-child {
        display: none;
      }
    }
  }
  @media screen and (max-width: 1100px) {
    display: none;
  }
}
.ml4 {
  margin-left: 4px;
}
.mobile-change-language {
  display: none;
  line-height: var(--o-line-height-h3);
  span {
    font-size: var(--o-font-size-tip);
    color: var(--o-color-text4);
    margin-right: 12px;
    cursor: pointer;
    &.active {
      color: var(--o-color-brand1);
      font-weight: 600;
    }
    &:not(:last-child) {
      &:after {
        content: '|';
        margin-left: 12px;
        color: var(--o-color-text4);
      }
    }
  }
  @media screen and (max-width: 1100px) {
    display: flex;
  }
}
</style>
