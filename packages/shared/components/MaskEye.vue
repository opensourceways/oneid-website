<script setup lang="ts">
import { toRefs } from 'vue';
import IconEyeclose from '~icons/app/icon-eyeclose.svg';
import IconEyeopen from '~icons/app/icon-eyeopen.svg';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue']);

const clickEye = () => {
  emit('update:modelValue', !modelValue.value);
};

</script>
<template>
<component class="eyes" :is="modelValue ? IconEyeclose : IconEyeopen" @click="clickEye"></component>
</template>
<style lang="scss" scoped>
.eyes {
  cursor: pointer;
}
</style>
