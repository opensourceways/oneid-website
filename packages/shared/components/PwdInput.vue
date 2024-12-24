<script setup lang="ts">
import { ref, shallowRef, useAttrs } from 'vue';
import IconEyeClose from '~icons/app/icon-eyeclose.svg';
import IconEyeOpen from '~icons/app/icon-eyeopen.svg';

defineProps({
  showPassword: {
    type: Boolean,
    default: false,
  },
});

const attrs = useAttrs();
const inputType = ref('password');
const iconCom = shallowRef(IconEyeClose);
const openEye = () => {
  inputType.value = 'text';
  iconCom.value = IconEyeOpen;
};
const closeEye = () => {
  inputType.value = 'password';
  iconCom.value = IconEyeClose;
};
</script>

<template>
  <OInput v-bind="attrs" :type="inputType" autocomplete="new-password">
    <template #suffix>
      <OIcon
        v-if="showPassword && attrs.modelValue"
        class="eye-icon"
        @mousedown="openEye"
        @mouseup="closeEye"
        @mouseleave="closeEye"
        @touchstart.prevent="openEye"
        @touchend.prevent="closeEye"
        @touchcancel.prevent="closeEye"
      >
        <component :is="iconCom"></component>
      </OIcon>
    </template>
  </OInput>
</template>

<style lang="scss" scoped>
.eye-icon {
  font-size: var(--o-font-size-h7);
  cursor: pointer;
}
</style>
