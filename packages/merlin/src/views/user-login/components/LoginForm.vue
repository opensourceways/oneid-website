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
  getUsernammeRules, validatorEmpty, getPwdRules, validatorPhone, formValidator, getCodeRules, validatorEmail,
} from 'shared/utils/rules';
import { useTestIsPhone } from 'shared/utils/helper';
import { sendCodeCaptcha } from 'shared/api/api-login';
import Verify from 'shared/verifition/Verify.vue';
import LoginTabs from '@/components/LoginTabs.vue';
import { useCommonData } from 'shared/stores/common';
import { ONLY_LOGIN_ID } from '@/shared/const';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const message = useMessage();
const router = useRouter();
const route = useRoute();
const isphone = useTestIsPhone()

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
)
// 重置登录失败输入框变红
const resetLoginErr = () => {
  const inputs = document.getElementsByClassName('login-pwd-input-danger');
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove('login-pwd-input-danger');
  }
}

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
        }
      }
    },
    triggers: 'change',
  },
]);

// 用户名校验
const userNameRules = reactive<RulesT[]>(getUsernammeRules());
const codeRules = reactive<RulesT[]>(getCodeRules());
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
})

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

// 账户失焦，判断发送验证码按钮是否禁用
const blurAccount = (formEl: InstanceType<typeof OForm> | undefined) => {
  if (!form.account) {
    disableCode.value = true;
  } else {
    formValidator(formEl, 'account').subscribe((valid) => {
      disableCode.value = !valid;
    });
  }
  resetLoginErr()
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
}
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
        @input="changeAccount(formRef)"
        @blur="blurAccount(formRef)"
      />
    </OFormItem>
    <OFormItem
      v-if="selectLoginType === 'code' || type === 'register'"
      field="code"
      :rules="codeRules"
    >
      <OInput
        :clearable="false"
        size="large"
        v-model.trim="form.code"
        :placeholder="i18n.ENTER_RECEIVED_CODE"
        class="login-code-input"
        maxlength="6"
      >
        <template #suffix>
          <CountdownButton
            v-model="disableCode"
            color="primary"
            @click="getcode(formRef)"
            size="small"
          />
        </template>
      </OInput>
    </OFormItem>
    <OFormItem
      v-if="selectLoginType === 'password'"
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
      <OButton id="e2e_login_submit" color="primary" variant="solid" size="large" class="login-btn" @click="submit()">
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
