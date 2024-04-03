<script setup lang="ts">
import { onUnmounted, Ref, ref, toRefs, useAttrs, watch } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import { OButton } from '@opensig/opendesign';

const attrs = useAttrs();
const i18n = useI18n();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'click']);
const num = ref(0);
let timer: NodeJS.Timeout;

// 验证码重发限制60s
const limitedToResend = (num: Ref<number>) => {
  num.value = 60;
  timer && clearInterval(timer);
  timer = setInterval(() => {
    if (num.value > 0) {
      num.value--;
    } else {
      num.value = 0;
      emit('update:modelValue', false);
      clearInterval(timer);
    }
  }, 1000);
};

watch(
  () => modelValue.value,
  (value) => {
    if (value) {
      limitedToResend(num);
    }
  }
);

onUnmounted(() => {
  timer && clearInterval(timer);
});

const clickBtn = () => {
  if (!modelValue.value) {
    emit('click');
  }
};
</script>
<template>
  <OButton v-bind="attrs" :disabled="modelValue" @click="clickBtn">{{
    modelValue ? useI18nStr('TRY_AGAIN', [num]).value : i18n.SEN_CODE
  }}</OButton>
</template>
<style lang="scss" scoped></style>
