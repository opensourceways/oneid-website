<script setup lang="ts">
import CountdownButton from '@/components/CountdownButton.vue';
import { PropType, reactive, ref, toRefs, computed, onMounted, onUnmounted, inject, watch } from 'vue';
import { useI18n } from 'shared/i18n';
import { OInput, OButton, OCheckbox, OLink, useMessage, OForm, OFormItem } from '@opensig/opendesign';
import { RulesT, ValidatorT } from '@opensig/opendesign/lib/form/types';
import {
  getVerifyImgSize,
} from 'shared/utils/utils';
import { useRoute, useRouter } from 'vue-router';
import {
  getUsernammeRules, validatorEmpty, getPwdRules, validatorPhone, formValidator, getCodeRules, getCodeRulesNormal, validatorEmail,
} from 'shared/utils/rules';
import { useTestIsPhone } from 'shared/utils/helper';
import { sendCodeCaptcha } from 'shared/api/api-login';
import Verify from 'shared/verifition/Verify.vue';
import LoginTabs from '@/components/LoginTabs.vue';
import { useCommonData } from 'shared/stores/common';
import { ONLY_LOGIN_ID } from '@/shared/const';
import { CODE_CAN_USE_REG } from 'shared/const/common.const';

type TYPE = 'login' | 'register' | 'perfectUserInfo';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const message = useMessage();
const router = useRouter();
const route = useRoute();
const isphone = useTestIsPhone();

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
  formValidator(formRef.value, fields).subscribe((valid) => {
    if (fields === 'code') {
      checkFields('code', valid as boolean);
    }
  });
};
// 清空输入校验
const clearValidate = (field: fieldT) => {
  formRef.value?.clearValidate(field);
  if (field === 'code' && form.code?.length >= 6) {
    doValidator('code');
  }
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

const loginAccountRuless = ref([
  {
    validator: validatorEmpty('ENTER_YOUR_ACCOUNT'),
    triggers: 'change',
  },
  {
    validator: (value) => {
      if (value && value.length < 3) {
        return {
          type: 'danger',
          message: useI18n().value.ACCOUNT_CONTAIN_CHARACTER,
        };
      }
    },
    triggers: 'change',
  },
]);

// 用户名校验
const userNameRules = reactive<RulesT[]>(getUsernammeRules());
// 点击按钮时校验
const codeRules = reactive<RulesT[]>(getCodeRules());
// 非点击按钮时校验
const codeRulesNormal = getCodeRulesNormal();
const loginPwdRules = reactive<RulesT[]>([
  {
    validator: validatorEmpty('INTER_PWD'),
    triggers: 'change',
  },
]);
const passwordRules = ref<RulesT[]>([
  {
    validator: validatorEmpty('INTER_PWD'),
    triggers: 'change',
  },
  ...getPwdRules(),
  {
    validator: validatorPwd,
    triggers: 'change',
  },
]);

// 账户校验
const phoneRules = reactive<RulesT[]>([
  {
    validator: validatorEmpty('ENTER_YOUR_PHONE'),
    triggers: 'change',
  },
  {
    validator: validatorPhone,
    triggers: 'change',
  },
]);
// 账户校验
const emailRules = reactive<RulesT[]>([
  {
    validator: validatorEmpty('ENTER_YOUR_EMAIL'),
    triggers: 'change',
  },
  {
    validator: validatorEmail,
    triggers: 'change',
  },
]);

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
const policyRules = reactive<RulesT[]>([
  {
    validator: validatorCheckbox,
    triggers: 'change',
  },
]);

// 用于识别用哪种code的校验方法
const clickOperateBtn = ref(false);
const submit = () => {
  clickOperateBtn.value = true;
  formValidator(formRef.value).subscribe((valid) => {
    clickOperateBtn.value = false;
    if (valid) {
      emit('submit', form);
    } else {
      return false;
    }
  });
};

let domeElement = document.querySelector('#codeInput input');
// 改变账户值，重置code或pwd
const changeAccount = (formEl: InstanceType<typeof OForm> | undefined) => {
  if (!domeElement) {
    domeElement = document.querySelector('#codeInput input');
  }
  if (type.value === 'login') {
    formEl?.resetFields('password');
  }
  formValidator(formEl, 'account').subscribe((valid) => {
    disableCode.value = !valid;
    // 不加异步延时，触发失焦无效
    setTimeout(() => {
      // 如果禁用发送验证码，主动对验证码输入框失焦一次，因为点击发送验证码按钮时会触发聚焦
      if (disableCode.value) {
        (domeElement as HTMLInputElement)?.blur();
      }
    }, 0);
  });
};

// 判断发送验证码按钮是否禁用
const checkCodeCanClick = (formEl: InstanceType<typeof OForm> | undefined) => {
  if (!form.account) {
    disableCode.value = true;
  } else {
    disableCode.value = !CODE_CAN_USE_REG.test(form.account);
    formValidator(formEl, 'account').subscribe((valid) => {
      checkFields('account', valid as boolean);
      clearValidate('account');
    });
  }
  formRef.value?.resetFields('code');
  clearValidate('code');
};
// 记录是否是用户主动点击按钮
let clickSendCodeBtn = false;
const codeFocus = () => {
  // 如果是点击发送验证码区域联代触发的点击事件，直接返回。是主动点击验证码输入框 才聚焦
  if (clickSendCodeBtn) {
    return;
  }
  if (!domeElement) {
    domeElement = document.querySelector('#codeInput input');
  }
  if (!domeElement) {
    domeElement = document.querySelector('#codeInput input');
  }
  (domeElement as HTMLInputElement)?.focus();
};
// 设置是否手动点击按钮
const setClickBtn = (b: boolean) => {
  clickSendCodeBtn = b;
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
// -------------------------------------- 完善用户信息按钮是否可点击 ----------------------------
const btnCanClick = ref(false);
type fieldT = 'account' | 'code';
type fieldObjectT = {
  account?: boolean;
  code?: boolean;
};
const ruleFields = computed<fieldObjectT>(() => {
  if (props.type === 'perfectUserInfo') {
    return {
      account: false,
      code: false,
    };
  } else {
    return {};
  }
});
watch(() => ruleFields.value, () => btnCanClick.value = false);
const checkFields = (field: fieldT, valid: boolean) => {
  if (props.type !== 'perfectUserInfo') {
    return;
  }
  if (ruleFields.value.hasOwnProperty(field)) {
    ruleFields.value[field] = valid;
  } else {
    return;
  }
  const values = Object.values(ruleFields.value);
  btnCanClick.value = values.every((one) => one);
};

const loginTabSelect = () => {
  formRef.value?.resetFields();
  disableCode.value = true;
  resetLoginErr();
};

// 键盘回车登录
const enterSubmit = (e: { key: string; }) => {
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
    showSwitch.value = !ONLY_LOGIN_ID.includes(
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

const goResetPwd = () => {
  router.push({
    path: '/resetPwd',
    query: route.query,
  });
};
</script>
<template>
  <OForm ref="formRef" label-width="0" :model="form" class="form" style="max-width: 460px">
    <OFormItem
      v-if="type === 'register'"
      field="username"
      :rules="userNameRules"
    >
      <OInput
        size="large"
        v-model.trim="form.username"
        :placeholder="i18n.ENTER_USERNAME"
      />
    </OFormItem>
    <OFormItem
      field="account"
      :rules="accountRules"
    >
      <OInput
        id="e2e_login_account"
        class="login-pwd-input"
        size="large"
        :title="accountPlaceholder"
        v-model.trim="form.account"
        :placeholder="accountPlaceholder"
        @input="checkCodeCanClick(formRef)"
        @blur="changeAccount(formRef)"
      />
    </OFormItem>
    <OFormItem
      v-if="selectLoginType === 'code' || type === 'register' || type === 'perfectUserInfo'"
      field="code"
      :rules="clickOperateBtn ? codeRules : codeRulesNormal"
    >
      <OInput
        id="codeInput"
        :clearable="false"
        size="large"
        v-model.trim="form.code"
        :placeholder="i18n.ENTER_RECEIVED_CODE"
        class="login-code-input"
        maxlength="6"
        @input="clearValidate('code')"
        @click="codeFocus"
      >
        <template #suffix>
          <CountdownButton
            v-model="disableCode"
            color="primary"
            @click="getcode(formRef)"
            @setClickBtn="setClickBtn"
            size="small"
          />
        </template>
      </OInput>
    </OFormItem>
    <OFormItem
      v-if="selectLoginType === 'password' && type != 'perfectUserInfo'"
      field="password"
      :rules="type === 'register' ? passwordRules : loginPwdRules"
    >
      <OInput
        id="e2e_login_password"
        class="login-pwd-input"
        size="large"
        type="password"
        v-model="form.password"
        :placeholder="i18n.INTER_PWD"
        @blur="resetLoginErr"
      />
    </OFormItem>
    <div v-if="type === 'login' && showSwitch" class="login-tabs">
      <LoginTabs
        v-model="selectLoginType"
        :type="type"
        @select="loginTabSelect"
        class="login-tab"
      ></LoginTabs>
      <OLink 
        v-if="isphone && selectLoginType === 'password'"
        class="login-tab  login-tab-right" 
        color="primary" 
        size="small" 
        hover-underline 
        @click="goResetPwd()"
      >{{ i18n.FORGET_PWD }}</OLink>
    </div>
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
          <OLink color="primary" hover-underline @click="goToOtherPage('privacy')">{{ i18n.PRIVACY_POLICY }}</OLink>
          <span>{{ i18n.PAUSE }}</span>
          <OLink color="primary" hover-underline @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</OLink>
          <span>{{ lang === 'zh' ? i18n.AND : '&nbsp;' + i18n.AND + '&nbsp;' }}</span>
          <OLink color="primary" hover-underline @click="goToOtherPage('terms-of-use')">{{ i18n.USER_SERVICE }}</OLink>
        </span>
      </div>
    </OFormItem>
    <OFormItem>
      <!-- 完善用户信息提交按钮，添加disabled-->
      <OButton v-if="type === 'perfectUserInfo'" id="e2e_login_submit" color="primary" variant="solid" size="large" class="login-btn" :disabled="!btnCanClick" @click="submit()">
        <slot name="btn"> {{ i18n.LOGIN }} </slot>
      </OButton>
      <OButton v-else id="e2e_login_submit" color="primary" variant="solid" size="large" class="login-btn" @click="submit()">
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
.login-tabs {
  margin-bottom: 14px;
  height: 22px;
  position: relative;
  .login-tab {
    position: absolute;
    top: -4px;
  }
  .login-tab-right {
    right: 0;
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
</style>
