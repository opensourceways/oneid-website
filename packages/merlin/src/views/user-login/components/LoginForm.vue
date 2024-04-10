<script setup lang="ts">
import CountdownButton from '@/components/CountdownButton.vue';
import { PropType, reactive, ref, toRefs, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'shared/i18n';
import { OInput, OButton, OCheckbox, OLink, useMessage, OForm, OFormItem } from '@opensig/opendesign';
import { RulesT, ValidatorT } from '@opensig/opendesign/lib/form/types';
import {
  getVerifyImgSize,
} from 'shared/utils/utils';
import {
  getUsernammeRules, validatorEmpty, getPwdRules, validatorPhone, formValidator,
} from 'shared/utils/rules';
import { sendCodeCaptcha } from 'shared/api/api-login';
import Verify from 'shared/verifition/Verify.vue';
import LoginTabs from 'shared/components/LoginTabs.vue';
import { useCommonData } from 'shared/stores/common';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const message = useMessage();

const formRef = ref<InstanceType<typeof OForm>>();

const emit = defineEmits(['submit', 'threePartLogin']);

// 外部校验方法
const validator = (fields?: string[] | string) => {
  return formValidator(formRef.value, fields);
};
defineExpose({ validator });

const doValidator = (fields?: string[] | string) => {
  formValidator(formRef.value, fields).subscribe();
}

const { type } = toRefs(props);
const i18n = useI18n();
const { lang, loginParams, selectLoginType } = useCommonData();
// 表单值
const form = reactive({
  username: '',
  account: '',
  code: '',
  policy: [],
  password: '',
} as any);

// 验证码限制重发
const disableCode = ref(false);
const verify = ref();
// 获取验证码
const getcode = (formEl: InstanceType<typeof OForm> | undefined) => {
  if (!formEl) return;
  formValidator(formEl, 'account').subscribe((valid) => {
    if (valid) {
      verify.value.show();
    } else {
      return false;
    }
  });
};

const verifySuccess = (data: any) => {
  let channel = 'CHANNEL_REGISTER';
  if (type.value === 'login') {
    channel = 'CHANNEL_LOGIN';
  } else if (selectLoginType.value === 'password') {
    channel = 'CHANNEL_REGISTER_BY_PASSWORD';
  }
  const param = {
    channel,
    account: form.account,
    captchaVerification: data.captchaVerification,
    client_id: loginParams.value.client_id,
    community: import.meta.env?.VITE_COMMUNITY,
  };
  sendCodeCaptcha(param).then(() => {
    disableCode.value = true;
    message.success({
      content: i18n.value.SEND_SUCCESS,
    });
  });
};

const changeCheckBox = () => {
  if (form.policy.length) {
    form.policy = [];
  } else {
    form.policy.push('1');
  }
  doValidator('policy');
};

// 校验密码不能包含用户名及其逆序
const validatorPwd: ValidatorT = (value: string) => {
  if (
    value &&
    ((form.username &&
      (value.includes(form.username) ||
        value.includes(form.username.split('').reverse().join('')))) ||
      (form.account &&
        (value.includes(form.account) ||
          value.includes(form.account.split('').reverse().join('')))))
  ) {
    return {
      type: 'danger',
      message: useI18n().value.PWD_USERNAME_VAILD,
    }
  }
};
// checkbox校验
const validatorCheckbox: ValidatorT = (value: Array<string>) => {
  if (!value || !value.length) {
    return {
      type: 'danger',
      message: useI18n().value.PLEASE_CHECK_PRIVACY,
    };
  }
};

// 空值校验
const requiredRules: RulesT[] = [
  {
    validator: validatorEmpty,
    triggers: 'blur',
  },
];
const rules = ref(requiredRules);

// 用户名校验
const userNameRules = reactive<RulesT[]>(getUsernammeRules());
const passwordRules = ref<RulesT[]>([
  ...requiredRules,
  ...getPwdRules(),
  {
    validator: validatorPwd,
    triggers: ['change', 'blur'],
  },
]);

// 账户校验
const accountRules = reactive<RulesT[]>([
  ...requiredRules,
  {
    validator: validatorPhone,
    triggers: 'blur',
  },
]);

// 隐私声明校验
const policyRules = reactive<RulesT[]>([
  {
    validator: validatorCheckbox,
    triggers: 'change',
  },
]);

const submit = () => {
  formValidator(formRef.value).subscribe((valid) => {
    if (valid) {
      emit('submit', form);
    } else {
      return false;
    }
  });
};

// 改变账户值，重置code或pwd
const changeAccount = (formEl: InstanceType<typeof OForm> | undefined) => {
  formEl?.resetFields('code');
  if (type.value === 'login') {
    formEl?.resetFields('password');
  }
};

// 隐私政策、法律声明
const goToOtherPage = (type: string) => {
  const origin = import.meta.env.VITE_OPENEULER_WEBSITE;
  const url = `${origin}/${type}/`;
  window.open(url, '_blank');
};
const accountPlaceholder = computed(() => {
  if (type.value === 'login' && selectLoginType.value === 'password') {
    return i18n.value.ENTER_YOUR_ACCOUNT_ID;
  } else {
    return i18n.value.ENTER_YOUR_PHONE;
  }
});
const loginTabSelect = () => {
  formRef.value?.resetFields();
  disableCode.value = false;
};

// 键盘回车登录
const enterSubmit = (e: { key: string; }) => {
  if (type.value === 'login' && e.key === 'Enter') {
    submit();
  }
}
onMounted(() => {
  window.addEventListener('keydown', enterSubmit);
});
onUnmounted(() => {
  window.removeEventListener('keydown', enterSubmit);
});
</script>
<template>
  <LoginTabs
    v-model="selectLoginType"
    :type="type"
    @select="loginTabSelect"
  ></LoginTabs>
  <OForm ref="formRef" label-width="0" :model="form" class="form" style="max-width: 460px">
    <OFormItem
      v-if="type === 'register'"
      field="username"
      :rules="userNameRules"
    >
      <OInput
        size="large"
        v-model.trim="form.username"
        :placeholder="i18n.ENTER_USERID"
      />
    </OFormItem>
    <OFormItem
      field="account"
      :rules="
        type === 'login' && selectLoginType === 'password'
          ? rules
          : accountRules
      "
    >
      <OInput
        size="large"
        v-model.trim="form.account"
        :placeholder="accountPlaceholder"
        @input="changeAccount(formRef)"
      />
    </OFormItem>
    <OFormItem
      v-if="selectLoginType === 'code' || type === 'register'"
      field="code"
      :rules="rules"
    >
      <OInput
        :clearable="false"
        size="large"
        v-model.trim="form.code"
        :placeholder="i18n.ENTER_RECEIVED_CODE"
      >
        <template #suffix>
          <CountdownButton
            v-model="disableCode"
            @click="getcode(formRef)"
            size="small"
          />
        </template>
      </OInput>
    </OFormItem>
    <OFormItem
      v-if="selectLoginType === 'password'"
      field="password"
      :rules="type === 'register' ? passwordRules : rules"
    >
      <OInput
        size="large"
        type="password"
        v-model="form.password"
        :placeholder="i18n.INTER_PWD"
      />
    </OFormItem>
    <OFormItem v-if="type === 'register'" field="policy" :rules="policyRules">
      <div class="checkbox">
        <OCheckbox 
            value="1" v-model="form.policy"
            @change="doValidator('policy')">
        </OCheckbox>
        <span>
          <span class="cursor" @click="changeCheckBox()">
            {{ i18n.READ_ADN_AGREE }}
          </span>
          <OLink @click="goToOtherPage('privacy')">{{ i18n.PRIVACY_POLICY }}</OLink>
          {{ i18n.AND }}
          <OLink @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</OLink>
        </span>
      </div>
    </OFormItem>
    <OFormItem>
      <OButton color="primary" variant="solid" size="large" class="login-btn" @click="submit()">
        <slot name="btn"> {{ i18n.LOGIN }} </slot>
      </OButton>
    </OFormItem>
  </OForm>
  <Verify
    ref="verify"
    mode="pop"
    captcha-type="blockPuzzle"
    :img-size="getVerifyImgSize()"
    @success="verifySuccess"
  ></Verify>
</template>
<style lang="scss" scoped>
.o-input {
  width: 100%;
}
.cursor {
  cursor: pointer;
}
.login-btn {
  width: 100%;
  justify-content: center;
}
.checkbox {
  display: grid;
  grid-template-columns: auto auto;
  align-items: start;
  color: var(--o-color-info1);
  white-space: nowrap;
  @include tip1;
  .o-checkbox-group {
    padding-top: 3px;
  }
}
.form {
  --form-label-main-gap: 0;
  .o-form-item:last-child {
    margin-bottom: var(--form-item-gap);
  }
  .o-form-item-danger {
    margin-bottom: 0 !important;
  }
}
</style>
