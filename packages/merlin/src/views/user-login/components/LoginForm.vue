<script setup lang="ts">
import CountdownButton from '@/components/CountdownButton.vue';
import { FormInstance, FormItemRule } from 'element-plus';
import { PropType, reactive, ref, toRefs, computed } from 'vue';
import { useI18n } from 'shared/i18n';
import { OInput, OButton, OCheckbox, OLink, useMessage } from '@opensig/opendesign';
import {
  formValidator,
  doValidatorForm,
  asyncBlur,
  getVerifyImgSize,
  getPwdRules,
  getUsernammeRules,
} from 'shared/utils/utils';
import { sendCodeCaptcha } from 'shared/api/api-login';
import Verify from 'shared/verifition/Verify.vue';
import { EMAIL_REG, PHONE_REG } from 'shared/const/common.const';
import { useCommonData } from 'shared/stores/common';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const message = useMessage();

const formRef = ref<FormInstance>();

const selectLoginType = ref('code');

const emit = defineEmits(['submit', 'threePartLogin']);

// 外部校验方法
const validator = (fields?: string[] | string) => {
  return formValidator(formRef.value, fields);
};
defineExpose({ validator });

const { type } = toRefs(props);
const i18n = useI18n();
const { lang, loginParams } = useCommonData();
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
// 验证码限制输入
const disableCodeInput = ref(true);
const verify = ref();
// 获取验证码
const getcode = (formEl: FormInstance | undefined) => {
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
    disableCodeInput.value = false;
    message.success({
      content: i18n.value.SEND_SUCCESS,
    });
  });
};

const changeCheckBox = (formEl: FormInstance | undefined) => {
  if (form.policy.length) {
    form.policy = [];
  } else {
    form.policy.push('1');
  }
  doValidatorForm(formEl, 'policy');
};

// 手机或邮箱合法校验
const validatorAccount = (rule: any, value: any, callback: any) => {
  if (value) {
    if (type.value === 'register') {
      if (PHONE_REG.test(value)) {
        callback();
      } else {
        callback(i18n.value.ENTER_VAILD_PHONE);
      }
    } else {
      if (EMAIL_REG.test(value) || PHONE_REG.test(value)) {
        callback();
      } else {
        callback(i18n.value.ENTER_VAILD_EMAIL_OR_PHONE);
      }
    }
  }
};

// 校验密码不能包含用户名及其逆序
const validatorPwd = (rule: any, value: any, callback: any) => {
  if (
    value &&
    ((form.username &&
      (value.includes(form.username) ||
        value.includes(form.username.split('').reverse().join('')))) ||
      (form.account &&
        (value.includes(form.account) ||
          value.includes(form.account.split('').reverse().join('')))))
  ) {
    callback(i18n.value.PWD_USERNAME_VAILD);
  } else {
    callback();
  }
};
// checkbox校验
const validatorCheckbox = (rule: any, value: any, callback: any) => {
  if (!value || !value.length) {
    callback(i18n.value.PLEASE_CHECK_PRIVACY);
  } else {
    callback();
  }
};

// 空值校验
const requiredRules: FormItemRule[] = [
  {
    required: true,
    message: i18n.value.NOT_EMPTY,
    trigger: 'blur',
  },
];
const rules = ref(requiredRules);

// 用户名校验
const userNameRules = reactive<FormItemRule[]>(getUsernammeRules());
const passwordRules = ref<FormItemRule[]>([
  ...requiredRules,
  ...getPwdRules(),
  {
    validator: validatorPwd,
    trigger: ['change', 'blur'],
  },
]);

// 账户校验
const accountRules = reactive<FormItemRule[]>([
  ...requiredRules,
  {
    validator: validatorAccount,
    trigger: 'blur',
  },
]);

// 隐私声明校验
const policyRules = reactive<FormItemRule[]>([
  {
    validator: validatorCheckbox,
    trigger: 'change',
  },
]);

const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl).subscribe((valid) => {
    if (valid) {
      emit('submit', form);
    } else {
      return false;
    }
  });
};

const blur = (formEl: FormInstance | undefined, field: string) => {
  if (type.value === 'register') {
    asyncBlur(formEl, field);
  } else {
    formValidator(formEl, field).subscribe();
  }
};

// 改变账户值，重置code或pwd
const changeAccount = (formEl: FormInstance | undefined) => {
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
  if (type.value === 'register') {
    return i18n.value.ENTER_YOUR_PHONE;
  } else {
    return i18n.value.ENTER_YOUR_EMAIL_OR_PHONE;
  }
});
</script>
<template>
  <el-form ref="formRef" label-width="0" :model="form" style="max-width: 460px">
    <el-form-item
      v-if="type === 'register'"
      prop="username"
      :rules="userNameRules"
    >
      <OInput
        v-model.trim="form.username"
        :placeholder="i18n.ENTER_USERNAME"
        @blur="blur(formRef, 'username')"
      />
    </el-form-item>
    <el-form-item
      prop="account"
      :rules="
        type === 'login' && selectLoginType === 'password'
          ? rules
          : accountRules
      "
    >
      <OInput
        v-model.trim="form.account"
        :placeholder="accountPlaceholder"
        @blur="blur(formRef, 'account')"
        @input="changeAccount(formRef)"
      />
    </el-form-item>
    <el-form-item
      v-if="selectLoginType === 'code' || type === 'register'"
      prop="code"
      :rules="rules"
    >
      <div class="code">
        <OInput
          v-model.trim="form.code"
          @blur="blur(formRef, 'code')"
          :placeholder="i18n.ENTER_RECEIVED_CODE"
          :disabled="type === 'register' ? false : disableCodeInput"
        />
        <CountdownButton
          v-model="disableCode"
          @click="getcode(formRef)"
        />
      </div>
    </el-form-item>
    <el-form-item v-if="type === 'register'" prop="policy" :rules="policyRules">
      <div class="checkbox">
        <OCheckbox 
            value="1" v-model="form.policy"
            @change="doValidatorForm(formRef, 'policy')">
        </OCheckbox>
        <span>
          <span class="cursor" @click="changeCheckBox(formRef)">
            {{ i18n.READ_ADN_AGREE }}
          </span>
          <span>&nbsp;</span>
          <OLink @click="goToOtherPage('privacy')">{{ i18n.PRIVACY_POLICY }}</OLink>
          {{ i18n.AND }}
          <OLink @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</OLink>
        </span>
      </div>
    </el-form-item>
    <el-form-item>
      <OButton color="primary" variant="solid" size="large" class="login-btn" @click="submit(formRef)">
        <slot name="btn"> {{ i18n.LOGIN }} </slot>
      </OButton>
    </el-form-item>
  </el-form>
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
.code {
  display: grid;
  grid-template-columns: auto max-content;
  width: 100%;
  grid-gap: 6px;
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
  @include tip1;
  .o-checkbox-group {
    padding-top: 3px;
  }
}
</style>
