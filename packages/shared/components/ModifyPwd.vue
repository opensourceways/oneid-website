<script setup lang="ts">
import { useI18n } from '../i18n';
import { reactive, ref, toRefs, watchEffect } from 'vue';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { EMAIL_REG, PHONE_REG } from '../const/common.const';
import CountdownButton from './CountdownButton.vue';
import { resetPwd, resetPwdVerify, sendCodeCaptcha } from '../api/api-login';
import {
  formValidator,
  getFitWidth,
  getPwdRules,
  getVerifyImgSize,
  isSendCodeEmail,
} from '../utils/utils';
import Verify from '../verifition/Verify.vue';
import { useCommonData } from '../stores/common';
import { getRsaEncryptWord } from '../utils/rsa';
import { logout } from '../utils/login';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue']);
const { loginParams, userInfo, lang } = useCommonData();
const i18n = useI18n();

const formRef = ref<FormInstance>();
// 表单值
const form = reactive({
  account: '',
  code: '',
  password: '',
  confirmPwd: '',
} as any);

const useAccount = ref('');

watchEffect(() => {
  if (modelValue.value) {
    if (isSendCodeEmail(userInfo.value.email) && userInfo.value.phone) {
      useAccount.value = 'email';
    } else {
      useAccount.value = '';
    }
    form.account =
      (isSendCodeEmail(userInfo.value.email) && userInfo.value.email) ||
      (import.meta.env?.VITE_COMMUNITY === 'openeuler'
        ? userInfo.value.phoneCountry
        : userInfo.value.phone);
  }
});

const changeAccount = () => {
  if (useAccount.value === 'email') {
    useAccount.value = 'phone';
    form.account =
      import.meta.env?.VITE_COMMUNITY === 'openeuler'
        ? userInfo.value.phoneCountry
        : userInfo.value.phone;
  } else if (useAccount.value === 'phone') {
    useAccount.value = 'email';
    form.account = userInfo.value.email;
  }
  formRef.value?.resetFields('code');
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

// 账户校验
const accountRules = reactive<FormItemRule[]>([
  ...requiredRules,
  {
    validator: validatorAccount,
    trigger: 'blur',
  },
]);
const passwordRules = ref<FormItemRule[]>([...requiredRules, ...getPwdRules()]);

// 确认密码校验
const validatorConfirmPwd = (rule: any, value: any, callback: any) => {
  if (value === form.password) {
    callback();
  } else {
    callback(i18n.value.CONFIRM_NOT_MATCH_PWD);
  }
};
const confirmPwdRules = reactive<FormItemRule[]>([
  ...requiredRules,
  {
    validator: validatorConfirmPwd,
    trigger: ['change', 'blur'],
  },
]);

// 验证码限制重发
const disableCode = ref(false);
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
  const param = {
    channel: 'channel_reset_password',
    account: form.account,
    captchaVerification: data.captchaVerification,
    client_id: loginParams.value.client_id,
    community: import.meta.env?.VITE_COMMUNITY,
  };
  sendCodeCaptcha(param).then(() => {
    disableCode.value = true;
    ElMessage.success({
      showClose: true,
      message: i18n.value.SEND_SUCCESS,
    });
  });
};
// 获取到重置token
const resetToken = ref('');
const nextStep = (formEl: FormInstance | undefined) => {
  formValidator(formEl).subscribe((valid) => {
    if (valid) {
      const param = {
        client_id: loginParams.value.client_id,
        community: import.meta.env?.VITE_COMMUNITY,
        account: form.account,
        code: form.code,
      };
      resetPwdVerify(param).then((res) => {
        resetToken.value = res.data;
      });
    } else {
      return false;
    }
  });
};
const close = () => {
  emit('update:modelValue', false);
  formRef.value?.resetFields();
  form.account = '';
  form.code = '';
  resetToken.value = '';
  disableCode.value = false;
};
const confirm = (formEl: FormInstance | undefined) => {
  formValidator(formEl).subscribe(async (valid) => {
    if (valid) {
      const newPwd = await getRsaEncryptWord(form.password);
      const param = {
        client_id: loginParams.value.client_id,
        community: import.meta.env?.VITE_COMMUNITY,
        pwd_reset_token: resetToken.value,
        new_pwd: newPwd,
      };
      resetPwd(param)
        .then(() => {
          ElMessage.success({
            showClose: true,
            message: i18n.value.MODIFY_SUCCESS,
          });
          const url = `${location.origin}/login?redirect_uri=${location.origin}/${lang.value}/profile&lang=${lang.value}`;
          const param: any = {
            community: import.meta.env?.VITE_COMMUNITY,
          };
          if (param.community === 'opengauss') {
            param.client_id = import.meta.env?.VITE_OPENEULER_APPID;
          }
          logout(param, url);
        })
        .catch((err) => {
          if (err?.response?.data?.msg?.code === 'E00056') {
            formRef.value?.resetFields(['code', 'password', 'confirmPwd']);
            form.code = '';
            resetToken.value = '';
            disableCode.value = false;
          }
        });
    } else {
      return false;
    }
  });
};
</script>
<template>
  <el-dialog
    v-model="modelValue"
    :before-close="close"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :width="getFitWidth(420)"
    align-center
  >
    <template #header>
      <h5 class="header">{{ i18n.FORGET_PWD }}</h5>
    </template>
    <el-form
      ref="formRef"
      label-width="0"
      :model="form"
      class="form"
      @submit.prevent=""
    >
      <span v-if="!resetToken">
        <el-form-item prop="account" :rules="accountRules">
          <a v-if="useAccount" @click="changeAccount">{{
            useAccount === 'email' ? i18n.USE_PHONE : i18n.USE_EMAIL
          }}</a>
          <OInput
            v-model="form.account"
            :placeholder="i18n.ENTER_YOUR_EMAIL_OR_PHONE"
            :disabled="true"
            @input="formRef?.resetFields('code')"
          />
        </el-form-item>
        <el-form-item prop="code" :rules="rules">
          <div class="code">
            <OInput
              v-model="form.code"
              :placeholder="i18n.ENTER_RECEIVED_CODE"
              maxlength="6"
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
        <el-form-item prop="password" :rules="passwordRules">
          <OInput
            v-model="form.password"
            :placeholder="i18n.INTER_NEW_PWD"
            type="password"
          />
        </el-form-item>
        <el-form-item prop="confirmPwd" :rules="confirmPwdRules">
          <OInput
            v-model="form.confirmPwd"
            :placeholder="i18n.CONFIRM_NEW_PWD"
            type="password"
          />
        </el-form-item>
      </span>
    </el-form>
    <template #footer>
      <div class="footer">
        <OButton size="small" @click="close">{{ i18n.CANCEL }}</OButton>
        <OButton
          v-if="!resetToken"
          size="small"
          type="primary"
          @click="nextStep(formRef)"
          >{{ i18n.NEXT_STEP }}</OButton
        >
        <OButton v-else size="small" type="primary" @click="confirm(formRef)">{{
          i18n.CONFIRM
        }}</OButton>
      </div>
    </template>
  </el-dialog>
  <Verify
    v-if="modelValue"
    ref="verify"
    mode="pop"
    captcha-type="blockPuzzle"
    :img-size="getVerifyImgSize()"
    @success="verifySuccess"
  ></Verify>
</template>
<style lang="scss" scoped>
.header {
  font-size: var(--o-font-size-h5);
  line-height: var(--o-line-height-h5);
  font-weight: normal;
  text-align: center;
  margin-left: var(--o-spacing-h5);
  padding-top: 28px;
}
.form {
  padding: 0 28px;
}
.footer {
  display: flex;
  justify-content: center;
  column-gap: var(--o-spacing-h5);
  padding-bottom: 28px;
}
.code {
  display: grid;
  grid-template-columns: auto max-content;
  width: 100%;
  grid-gap: var(--o-spacing-h9);
}
.btn {
  height: 38px;
}
.el-form-item {
  margin-bottom: 28px;
  @media (max-width: 1100px) {
    margin-bottom: 40px;
  }
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
</style>
