<script setup lang="ts">
import ContentTemplate from './ContentTemplate.vue';
import LoginForm from './LoginForm.vue';
import ThirdLoginBtns from 'shared/components/ThirdLoginBtns.vue';
import { PropType, ref, toRefs } from 'vue';
import { useI18n } from 'shared/i18n';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const loginForm = ref();
const emit = defineEmits(['submit']);

const { type } = toRefs(props);
const i18n = useI18n();

const submit = (form: any) => {
  emit('submit', form);
};
const thirdLogin = (fn: any) => {
  loginForm.value?.validator('policy').subscribe((valid: boolean) => {
    if (valid) {
      fn();
    } else {
      return false;
    }
  });
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
      <LoginForm ref="loginForm" :type="type" @submit="submit">
        <template #btn>
          <slot name="btn"></slot>
        </template>
      </LoginForm>
    </template>
    <template v-if="type === 'login'" #footer>
      <ThirdLoginBtns @third-login="thirdLogin"></ThirdLoginBtns>
    </template>
  </ContentTemplate>
</template>
