<script setup lang="ts">
import ContentTemplate from './ContentTemplate.vue';
import LoginForm from './LoginForm.vue';
import { PropType, toRefs } from 'vue';
import { useI18n } from 'shared/i18n';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const emit = defineEmits(['submit']);

const { type } = toRefs(props);
const i18n = useI18n();

const submit = (form: any) => {
  emit('submit', form);
};
</script>
<template>
  <ContentTemplate>
    <template #headerTitle>
      <slot name="headerTitle"> {{ i18n.ACCOUNT_LOGIN }} </slot>
    </template>
    <template #switch>
      <slot name="switch"></slot>
    </template>
    <template #body>
      <LoginForm :type="type" @submit="submit">
        <template #btn>
          <slot name="btn"></slot>
        </template>
      </LoginForm>
    </template>
  </ContentTemplate>
</template>
<style lang="scss" scoped>
.gap {
  margin-left: var(--o-spacing-h2);
}
.icon {
  font-size: var(--o-font-size-h3);
  cursor: pointer;
}
</style>
