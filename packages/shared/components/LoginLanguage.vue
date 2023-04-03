<script lang="ts" setup>
import { ref, Ref, watch } from 'vue';
import { useCommonData } from '../stores/common';

const props = defineProps({
  show: {
    type: Object,
    default() {
      return ['zh', 'en'];
    },
  },
});

const { lang } = useCommonData();

// 选择语言;
const langOptions = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
  { id: 'ru', label: 'Русский' },
];

// 选择语言
const emits = defineEmits(['language-click']);

function chaneLanguage(newlang: string) {
  if (lang.value === newlang) return;
  lang.value = newlang;
  emits('language-click', newlang);
}

interface LangType {
  id: string;
  label: string;
}
const langList: Ref<LangType[]> = ref([]);
const filterLang = () => {
  langList.value = [];
  props.show.forEach((item: string) => {
    langOptions.filter((el: LangType) => {
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
  <div class="lang-body">
    <div class="lang-list">
      <template v-for="(item, index) in langList" :key="item.id">
        <span v-if="index">丨</span>
        <span
          class="select-item"
          :class="{ selected: lang === item.id }"
          @click="chaneLanguage(item.id)"
          >{{ item.label }}</span
        >
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lang-body {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.lang-list {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  gap: var(--o-spacing-h10);
  .select-item {
    cursor: pointer;
    font-size: var(--o-font-size-tip);
    line-height: var(--o-line-height-tip);
    &:hover {
      color: var(--o-color-brand2);
    }
  }
  .selected {
    color: var(--o-color-brand1);
    &:hover {
      color: var(--o-color-brand1);
    }
  }
}
</style>
