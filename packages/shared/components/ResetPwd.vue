<script setup lang="ts">
import { useI18n } from '../i18n';
import { reactive, ref } from 'vue';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { EMAIL_REG, PHONE_REG } from '../const/common.const';
import CountdownButton from './CountdownButton.vue';
import {
  accountExists,
  resetPwd,
  resetPwdVerify,
  sendCodeCaptcha,
} from '../api/api-login';
import { formValidator, getPwdRules, getVerifyImgSize } from '../utils/utils';
import Verify from '../verifition/Verify.vue';
import { useCommonData } from '../stores/common';
import { getRsaEncryptWord } from '../utils/rsa';
import { useRoute, useRouter } from 'vue-router';

const { loginParams } = useCommonData();
const i18n = useI18n();

const router = useRouter();
const route = useRoute();
const goLogin = () => {
  router.push({
    path: '/login',
    query: route.query,
  });
};

const formRef = ref<FormInstance>();
// 表单值
const form = reactive({
  account: '',
  code: '',
  password: '',
  confirmPwd: '',
} as any);

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
// 手机或邮箱是否存在校验
const validatorExistAccount = (rule: any, value: any): void | Promise<void> => {
  if (value) {
    return new Promise((resolve, reject) => {
      accountExists({ account: value, client_id: loginParams.value.client_id })
        .then(() => {
          reject(i18n.value.ACCOUNT_NOT_EXIST);
        })
        .catch(() => {
          resolve();
        });
    });
  }
};
// 账户校验
const accountRules = reactive<FormItemRule[]>([
  ...requiredRules,
  {
    validator: validatorAccount,
    trigger: 'blur',
  },
  {
    asyncValidator: validatorExistAccount,
    trigger: 'none',
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
            message: i18n.value.RESET_SUCCESS,
          });
          goLogin();
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
  <h5 class="header">{{ i18n.RESET_PWD }}</h5>
  <el-form
    ref="formRef"
    label-width="0"
    :model="form"
    class="form"
    @submit.prevent=""
  >
    <span v-if="!resetToken">
      <el-form-item prop="account" :rules="accountRules">
        <OInput
          v-model="form.account"
          :placeholder="i18n.ENTER_YOUR_EMAIL_OR_PHONE"
          @input="formRef?.resetFields('code')"
        />
      </el-form-item>
      <el-form-item prop="code" :rules="rules">
        <div class="code">
          <OInput v-model="form.code" :placeholder="i18n.ENTER_RECEIVED_CODE" />
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
  <div class="footer">
    <OButton size="small" @click="goLogin">
      {{ i18n.RETURN_LOGIN }}
    </OButton>
    <OButton
      v-if="!resetToken"
      size="small"
      type="primary"
      @click="nextStep(formRef)"
    >
      {{ i18n.NEXT_STEP }}
    </OButton>
    <OButton v-else size="small" type="primary" @click="confirm(formRef)">
      {{ i18n.CONFIRM }}
    </OButton>
  </div>
  <Verify
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
  padding-bottom: 28px;
}
.footer {
  display: flex;
  justify-content: center;
  column-gap: var(--o-spacing-h5);
  padding-top: var(--o-spacing-h5);
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
