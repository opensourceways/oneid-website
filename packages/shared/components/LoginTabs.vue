<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../i18n';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'password',
  },
  type: {
    type: String,
    default: 'login',
  },
});
const i18n = useI18n();
const emit = defineEmits(['update:modelValue', 'select']);
const tabs = computed(() => [
  {
    value: 'password',
    label: props.type === 'login' ? 'LOGIN_PWD' : 'REGISTER_PWD',
  },
  {
    value: 'code',
    label: props.type === 'login' ? 'LOGIN_CODE' : 'REGISTER_CODE',
  },
]);
const select = (key: string) => {
  emit('update:modelValue', key);
  emit('select', key);
};
</script>
<template>
  <div class="login-tabs">
    <div
      v-for="item in tabs"
      :key="item.value"
      class="tab"
      :class="modelValue === item.value ? 'selected' : ''"
      @click="select(item.value)"
    >
      {{ i18n[item.label] }}
    </div>
  </div>
</template>
<style lang="scss" scoped>
.login-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: var(--o-spacing-h5);
  margin-bottom: 24px;
  .tab {
    font-weight: 500;
    height: 32px;
    box-sizing: border-box;
    cursor: pointer;
  }
  .selected {
    color: var(--o-color-brand1);
    border-bottom: 2px solid var(--o-color-brand1);
  }
}
</style>
