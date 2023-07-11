<script setup lang="ts">
import CountdownButton from 'shared/components/CountdownButton.vue';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { PropType, reactive, ref, toRefs } from 'vue';
import { useI18n } from 'shared/i18n';
import {
  formValidator,
  doValidatorForm,
  asyncBlur,
  getCompanyRules,
  getVerifyImgSize,
  getPwdRules,
  getUsernammeRules,
} from 'shared/utils/utils';
import { sendCodeCaptcha } from 'shared/api/api-login';
import Verify from 'shared/verifition/Verify.vue';
import LoginTabs from 'shared/components/LoginTabs.vue';
import PwdInput from 'shared/components/PwdInput.vue';
import { EMAIL_REG, PHONE_REG } from 'shared/const/common.const';
import { useCommonData } from 'shared/stores/common';
import { getCommunityParams } from '@/shared/utils';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const selectLoginType = ref('password');

const emit = defineEmits(['submit']);

const { type } = toRefs(props);
const i18n = useI18n();
const { lang } = useCommonData();
const formRef = ref<FormInstance>();
// 表单值
const form = reactive({
  username: '',
  account: '',
  code: '',
  password: '',
  company: '',
  policy: [],
} as any);

// 验证码限制重发
const disableCode = ref(false);
const verify = ref();
// 获取验证码
const getcode = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl, ['account', 'username', 'company']).subscribe(
    (valid) => {
      if (valid) {
        verify.value.show();
      } else {
        return false;
      }
    }
  );
};

const verifySuccess = (data: any) => {
  let channel = 'CHANNEL_REGISTER';
  if (type.value === 'login') {
    channel = 'CHANNEL_LOGIN';
  } else if (selectLoginType.value === 'password') {
    channel = 'CHANNEL_REGISTER_BY_PASSWORD';
  }
  const param = {
    ...getCommunityParams(),
    channel,
    account: form.account,
    captchaVerification: data.captchaVerification,
  };
  sendCodeCaptcha(param).then(() => {
    disableCode.value = true;
    ElMessage.success({
      showClose: true,
      message: i18n.value.SEND_SUCCESS,
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
    if (EMAIL_REG.test(value) || PHONE_REG.test(value)) {
      callback();
    } else {
      callback(i18n.value.ENTER_VAILD_EMAIL_OR_PHONE);
    }
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

// 公司校验
const companyRules = reactive<FormItemRule[]>([
  ...requiredRules,
  ...getCompanyRules(),
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
  const url = `${origin}/${lang.value}/${type}/`;
  window.open(url, '_blank');
};

const loginTabSelect = () => {
  formRef.value?.resetFields();
  disableCode.value = false;
};
</script>
<template>
  <LoginTabs
    v-model="selectLoginType"
    :type="type"
    @select="loginTabSelect"
  ></LoginTabs>
  <el-form ref="formRef" label-width="0" :model="form" style="max-width: 460px">
    <span v-if="type === 'register'">
      <el-form-item prop="username" :rules="userNameRules">
        <OInput
          v-model.trim="form.username"
          :placeholder="i18n.ENTER_USERNAME"
          @blur="blur(formRef, 'username')"
        />
      </el-form-item>
      <el-form-item prop="company" :rules="companyRules">
        <OInput v-model="form.company" :placeholder="i18n.ENTER_COMPANY" />
      </el-form-item>
      <el-form-item prop="account" :rules="accountRules">
        <OInput
          v-model.trim="form.account"
          :placeholder="i18n.ENTER_YOUR_EMAIL_OR_PHONE"
          @blur="blur(formRef, 'account')"
        />
      </el-form-item>
      <el-form-item prop="code" :rules="rules">
        <div class="code">
          <OInput
            v-model.trim="form.code"
            :placeholder="i18n.ENTER_RECEIVED_CODE"
          />
          <CountdownButton
            v-model="disableCode"
            class="btn"
            size="small"
            @click="getcode(formRef)"
          />
        </div>
      </el-form-item>
    </span>
    <span v-else>
      <el-form-item
        prop="account"
        :rules="selectLoginType === 'code' ? accountRules : rules"
      >
        <OInput
          v-model.trim="form.account"
          :placeholder="
            selectLoginType === 'code'
              ? i18n.ENTER_YOUR_EMAIL_OR_PHONE
              : i18n.ENTER_YOUR_ACCOUNT
          "
          @blur="blur(formRef, 'account')"
        />
      </el-form-item>
      <el-form-item
        v-if="selectLoginType === 'code'"
        prop="code"
        :rules="rules"
      >
        <div class="code">
          <OInput
            v-model.trim="form.code"
            :placeholder="i18n.ENTER_RECEIVED_CODE"
          />
          <CountdownButton
            v-model="disableCode"
            class="btn"
            size="small"
            @click="getcode(formRef)"
          />
        </div>
      </el-form-item>
    </span>
    <el-form-item
      v-if="selectLoginType === 'password'"
      prop="password"
      :rules="type === 'register' ? passwordRules : rules"
    >
      <PwdInput
        v-model="form.password"
        :placeholder="i18n.INTER_PWD"
        :show-password="type === 'register'"
      />
    </el-form-item>
    <el-form-item prop="policy" :rules="policyRules">
      <div class="checkbox">
        <OCheckboxGroup
          v-model="form.policy"
          @change="doValidatorForm(formRef, 'policy')"
        >
          <OCheckbox value="1"></OCheckbox>
        </OCheckboxGroup>
        <span>
          <span class="cursor" @click="changeCheckBox(formRef)">
            {{ i18n.READ_ADN_AGREE }}
          </span>
          <span>&nbsp;</span>
          <a @click="goToOtherPage('privacyPolicy')">{{
            i18n.PRIVACY_POLICY
          }}</a>
          {{ i18n.AND }}
          <a @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</a>
        </span>
      </div>
    </el-form-item>
    <el-form-item>
      <OButton type="primary" class="login-btn" @click="submit(formRef)">
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
.code {
  display: grid;
  grid-template-columns: auto max-content;
  width: 100%;
  grid-gap: var(--o-spacing-h9);
}
.cursor {
  cursor: pointer;
}
.btn {
  height: 38px;
}
.login-btn {
  width: 100%;
  justify-content: center;
}
.checkbox {
  display: grid;
  grid-template-columns: auto auto;
  align-items: start;
  color: var(--o-color-text1);
  font-size: var(--o-font-size-text);
  line-height: var(--o-line-height-text);
  .o-checkbox-group {
    padding-top: 3px;
  }
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
.el-form-item {
  margin-bottom: 28px;
  @media (max-width: 1100px) {
    margin-bottom: 40px;
  }
}
:deep(.el-form-item__error--inline) {
  margin-left: 0 !important;
}
</style>
