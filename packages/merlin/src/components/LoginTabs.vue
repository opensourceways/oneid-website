<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import { OLink } from '@opensig/opendesign';

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

const labelMap: any = {
  code: 'LOGIN_PWD',
  password: 'LOGIN_CODE',
};

const select = (key: string) => {
  const _key = key === 'password' ? 'code' : 'password';
  emit('update:modelValue', _key);
  emit('select', _key);
};
</script>
<template>
  <OLink size="small" @click="select(modelValue)" hover-underline>{{ i18n[labelMap[modelValue]] }}</OLink>
</template>
<style lang="scss" scoped>

</style>
