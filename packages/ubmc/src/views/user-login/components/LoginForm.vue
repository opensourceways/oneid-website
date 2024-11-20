<script setup lang="ts">
import CountdownButton from '@/components/CountdownButton.vue';
import {
  PropType,
  reactive,
  ref,
  toRefs,
  computed,
  onMounted,
  onUnmounted,
  inject,
  watch,
  watchEffect,
} from 'vue';
import { useI18n } from 'shared/i18n';
import {
  OInput,
  OButton,
  OCheckbox,
  OLink,
  useMessage,
  OForm,
  OFormItem,
} from '@opensig/opendesign';
import { ValidatorT } from '@opensig/opendesign/lib/form/types';
import { getVerifyImgSize } from 'shared/utils/utils';
import {
  getUsernammeRules,
  validatorEmpty,
  getPwdRules,
  validatorPhone,
  formValidator,
  getCodeRules,
  validatorEmail,
} from 'shared/utils/rules';
import { sendCodeCaptcha } from 'shared/api/api-login';
import Verify from 'shared/verifition/Verify.vue';
import LoginTabs from 'shared/components/LoginTabs.vue';
import { useCommonData } from 'shared/stores/common';
import { ONLY_LOGIN_ID } from '@/shared/const';

type TYPE = 'login' | 'register' | 'perfectUserInfo';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const message = useMessage();

// 登录失败输入框变红
const loginErr: any = inject('loginErr');
watch(
  () => loginErr,
  (val) => {
    if (val.value) {
      if (val.value === 'E00052') {
        const inputs = document.getElementsByClassName('login-pwd-input');
        inputs[0].classList.add('login-pwd-input-danger');
        inputs[1].classList.add('login-pwd-input-danger');
      }
      if (val.value === 'E0002') {
        const inputs = document.getElementsByClassName('login-code-input');
        inputs[0].classList.add('o-input-danger');
      }
      loginErr.value = '';
    }
  },
  {
    deep: true,
  }
);
// 重置登录失败输入框变红
const resetLoginErr = () => {
  const inputs = document.getElementsByClassName('login-pwd-input-danger');
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove('login-pwd-input-danger');
  }
};

const formRef = ref<InstanceType<typeof OForm>>();

const emit = defineEmits(['submit', 'sendCode']);

// 外部校验方法
const validator = (fields?: string[] | string) => {
  return formValidator(formRef.value, fields);
};
defineExpose({ validator });

const doValidator = (fields?: string[] | string) => {
  formValidator(formRef.value, fields).subscribe();
};

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
const disableCode = ref(true);
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
  // 完善用户信息添加的验证码逻辑，和注册验证码接口分开
  if (type.value === 'perfectUserInfo') {
    emit('sendCode', form, data);
    disableCode.value = true;
    return;
  }
  // 其他验证码调用接口
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
    };
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

const loginAccountRuless = [
  {
    validator: validatorEmpty('ENTER_YOUR_ACCOUNT'),
    triggers: 'change',
  },
  {
    validator: (value: string) => {
      if (value && value.length < 3) {
        return {
          type: 'danger',
          message: useI18n().value.ACCOUNT_CONTAIN_CHARACTER,
        };
      }
    },
    triggers: 'change',
  },
];

// 用户名校验
const userNameRules = getUsernammeRules();
const codeRules = getCodeRules();
const loginPwdRules = [
  {
    validator: validatorEmpty('INTER_PWD'),
    triggers: 'change',
  },
];
const passwordRules = [
  {
    validator: validatorEmpty('INTER_PWD'),
    triggers: 'change',
  },
  ...getPwdRules(),
  {
    validator: validatorPwd,
    triggers: 'change',
  },
];

// 账户校验
const phoneRules = [
  {
    validator: validatorEmpty('ENTER_YOUR_PHONE'),
    triggers: 'change',
  },
  {
    validator: validatorPhone,
    triggers: 'change',
  },
];
// 账户校验
const emailRules = [
  {
    validator: validatorEmpty('ENTER_YOUR_EMAIL'),
    triggers: 'change',
  },
  {
    validator: validatorEmail,
    triggers: 'change',
  },
];

const accountRules = computed(() => {
  if (type.value === 'login' && selectLoginType.value === 'password') {
    return loginAccountRuless;
  } else if (!showSwitch.value) {
    return emailRules;
  } else {
    return phoneRules;
  }
});

// 隐私声明校验
const policyRules = [
  {
    validator: validatorCheckbox,
    triggers: 'change',
  },
];

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
  checkCodeCanClick(formEl);
};

// 判断发送验证码按钮是否禁用
const checkCodeCanClick = (formEl: InstanceType<typeof OForm> | undefined) => {
  if (!form.account) {
    disableCode.value = true;
  } else {
    formValidator(formEl, 'account').subscribe((valid) => {
      disableCode.value = !valid;
    });
  }
  resetLoginErr();
};

// 隐私政策、法律声明
const goToOtherPage = (type: string) => {
  const origin = import.meta.env.VITE_OPENEULER_WEBSITE;
  const url = `${origin}/${type}/`;
  window.open(url, '_blank');
};
const accountPlaceholder = computed(() => {
  if (type.value === 'login' && selectLoginType.value === 'password') {
    return i18n.value.ENTER_YOUR_ACCOUNT;
  } else if (!showSwitch.value) {
    return i18n.value.ENTER_YOUR_EMAIL;
  } else {
    return i18n.value.ENTER_YOUR_PHONE;
  }
});
const btnCanClick = ref(false);

watchEffect(async () => {
  const res = await formRef.value?.validate();
  formRef.value?.clearValidate();
  if (res?.length) {
    // 有表单项，所有表单项都校验通过按钮才可点击；否则，不可点击
    const r = res.every((v) => !v);
    btnCanClick.value = r;
  } else {
    // 没有表单项，按钮可点击
    btnCanClick.value = true;
  }
});
const loginTabSelect = () => {
  formRef.value?.resetFields();
  disableCode.value = true;
  resetLoginErr();
};

// 键盘回车登录
const enterSubmit = (e: { key: string }) => {
  if (type.value === 'login' && e.key === 'Enter') {
    submit();
  }
};
onMounted(() => {
  window.addEventListener('keydown', enterSubmit);
});
onUnmounted(() => {
  window.removeEventListener('keydown', enterSubmit);
});
const showSwitch = ref(true);
watch(
  () => loginParams.value.client_id,
  () => {
    showSwitch.value = !(ONLY_LOGIN_ID as string[]).includes(
      loginParams.value.client_id as string
    );
    if (!showSwitch.value) {
      selectLoginType.value = 'code';
    }
  },
  {
    immediate: true,
  }
);
</script>
<template>
  <!-- 密码和验证码的切换 -->
  <LoginTabs
    v-if="showSwitch && type !== 'perfectUserInfo'"
    v-model="selectLoginType"
    :type="type"
    class="login-tab"
    @select="loginTabSelect"
  ></LoginTabs>
  <OForm
    id="login-formss"
    ref="formRef"
    label-width="0"
    :model="form"
    class="form"
    style="max-width: 460px"
  >
    <!-- 用户名 -->
    <OFormItem
      v-if="type === 'register'"
      field="username"
      :rules="userNameRules"
    >
      <OInput
        v-model.trim="form.username"
        size="large"
        :placeholder="i18n.ENTER_USERNAME"
        @change="formValidator(formRef, 'username')"
      />
    </OFormItem>
    <!-- 账号： 手机号、邮箱 -->
    <OFormItem field="account" :rules="accountRules">
      <OInput
        id="e2e_login_account"
        v-model.trim="form.account"
        class="login-pwd-input"
        size="large"
        :title="accountPlaceholder"
        :placeholder="accountPlaceholder"
        @input="changeAccount(formRef)"
      />
    </OFormItem>
    <!-- 验证码 -->
    <OFormItem
      v-if="
        selectLoginType === 'code' ||
        type === 'register' ||
        type === 'perfectUserInfo'
      "
      field="code"
      :rules="codeRules"
    >
      <OInput
        v-model.trim="form.code"
        :clearable="false"
        size="large"
        :placeholder="i18n.ENTER_RECEIVED_CODE"
        class="login-code-input"
        maxlength="6"
        @change="formValidator(formRef, 'code')"
      >
        <template #suffix>
          <CountdownButton
            v-model="disableCode"
            color="primary"
            size="small"
            @click="getcode(formRef)"
          />
        </template>
      </OInput>
    </OFormItem>
    <!-- 密码 -->
    <OFormItem
      v-if="selectLoginType === 'password' && type != 'perfectUserInfo'"
      field="password"
      :rules="type === 'register' ? passwordRules : loginPwdRules"
    >
      <OInput
        id="e2e_login_password"
        v-model="form.password"
        class="login-pwd-input"
        size="large"
        type="password"
        :placeholder="i18n.INTER_PWD"
        @blur="resetLoginErr"
        @change="formValidator(formRef, 'password')"
      />
    </OFormItem>
    <!-- 隐私政策和法律文件 -->
    <OFormItem v-if="type === 'register'" field="policy" :rules="policyRules">
      <div class="checkbox">
        <OCheckbox
          v-model="form.policy"
          value="1"
          @change="doValidator('policy')"
        >
        </OCheckbox>
        <span>
          <span class="cursor" @click="changeCheckBox()">
            {{ i18n.READ_ADN_AGREE }}
          </span>
          <OLink
            color="primary"
            hover-underline
            @click="goToOtherPage('privacy')"
            >{{ i18n.PRIVACY_POLICY }}</OLink
          >
          <span>{{
            lang === 'zh' ? i18n.AND : '&nbsp;' + i18n.AND + '&nbsp;'
          }}</span>
          <OLink
            color="primary"
            hover-underline
            @click="goToOtherPage('legal')"
            >{{ i18n.LEGAL_NOTICE }}</OLink
          >
        </span>
      </div>
    </OFormItem>
    <OFormItem>
      <!-- 完善用户信息提交按钮，添加disabled-->
      <OButton
        v-if="type === 'perfectUserInfo'"
        id="e2e_login_submit"
        color="primary"
        variant="solid"
        size="large"
        class="login-btn"
        :disabled="!btnCanClick"
        @click="submit()"
      >
        <slot name="btn"> {{ i18n.LOGIN }} </slot>
      </OButton>
      <OButton
        v-else
        id="e2e_login_submit"
        color="primary"
        :disabled="!btnCanClick"
        variant="solid"
        size="large"
        class="login-btn"
        @click="submit()"
      >
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
  font-size: 14px;
  line-height: 22px;
  .o-checkbox-group {
    padding-top: 3px;
  }
}
.login-tab {
  margin-bottom: 24px;
  position: relative;
  font-size: var(--o-font-size-h6);
  line-height: 28px;
  :deep(.tab) {
    padding-bottom: 17px;
    height: auto;
  }
}
.form {
  --form-label-main-gap: 0;
  .o-form-item:last-child {
    margin-bottom: 12px;
  }
  .o-form-item-danger {
    margin-bottom: 0 !important;
  }
}
.login-pwd-input-danger {
  --input-bd-color: var(--o-color-danger1);
  --input-bd-color-hover: var(--o-color-danger2);
  --input-bd-color-focus: var(--o-color-danger3);
  --input-bd-color-disabled: var(--o-color-danger4);
}
.o-form.reset-danger {
  :deep(.type-danger) {
    visibility: hidden;
  }
}
</style>
