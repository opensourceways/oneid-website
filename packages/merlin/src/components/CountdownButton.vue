<script setup lang="ts">
import { onUnmounted, ref, toRefs, useAttrs, watch } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import { OLink } from '@opensig/opendesign';

const attrs = useAttrs();
const i18n = useI18n();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'click', 'setClickBtn']);
const num = ref(0);
let timer: NodeJS.Timeout;
let stopwatch: () => void;
// 验证码重发限制60s
const limitedToResend = () => {
  num.value = 60;
  timer && clearInterval(timer);
  timer = setInterval(() => {
    if (num.value > 0) {
      num.value--;
    } else {
      num.value = 0;
      // emit('update:modelValue', false);
      clearInterval(timer);
      stopwatch();
    }
  }, 1000);
};

onUnmounted(() => {
  timer && clearInterval(timer);
});

const clickBtn = () => {
  // 手动点击发送验证码按钮
  emit('setClickBtn', true);
  // modelValue是异步计算得到的，这里等待一段时间后在用modelValue的值
  setTimeout(() => {
    if (!modelValue.value) {
      stopwatch = watch(
        () => modelValue.value,
        (value) => {
          if (value && !num.value) {
            limitedToResend();
          }
        }
      );
      emit('click');
    }
    emit('setClickBtn', false);
  }, 10);
};
</script>
<template>
  <OLink v-bind="attrs" :disabled="Boolean(num) || modelValue" @click.stop="clickBtn">{{
    num ? useI18nStr('TRY_AGAIN', [num]).value : i18n.SEN_CODE
  }}</OLink>
</template>
<style lang="scss" scoped></style>
