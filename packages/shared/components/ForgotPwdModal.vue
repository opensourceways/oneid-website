<script setup lang="ts">
import { useI18n } from '../i18n';
import { reactive, ref, toRefs } from 'vue';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { EMAIL_REG, PHONE_REG } from '../const/common.const';
import CountdownButton from './CountdownButton.vue';
import {
  accountExists,
  resetPwd,
  resetPwdVerify,
  sendCodeCaptcha,
} from '../api/api-login';
import {
  formValidator,
  getFitWidth,
  getPwdRules,
  getVerifyImgSize,
} from '../utils/utils';
import Verify from '../verifition/Verify.vue';
import { useCommonData } from '../stores/common';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue']);
const { loginParams } = useCommonData();
const i18n = useI18n();

const close = () => {
  emit('update:modelValue', false);
  formRef.value?.resetFields();
};
const formRef = ref<FormInstance>();
// 表单值
const form = reactive({
  account: '',
  code: '',
  password: '',
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
  formValidator(formEl).subscribe((valid) => {
    if (valid) {
      const param = {
        community: import.meta.env?.VITE_COMMUNITY,
        pwd_reset_token: resetToken.value,
        new_pwd: form.password,
      };
      resetPwd(param).then(() => {
        ElMessage.success({
          showClose: true,
          message: i18n.value.RESET_SUCCESS,
        });
        close();
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
      <h5 class="header">{{ i18n.RESET_PWD }}</h5>
    </template>
    <el-form
      ref="formRef"
      label-width="0"
      :model="form"
      class="form"
      @submit.prevent=""
    >
      <el-form-item v-if="!resetToken" prop="account" :rules="accountRules">
        <OInput
          v-model="form.account"
          :placeholder="i18n.ENTER_YOUR_EMAIL_OR_PHONE"
        />
      </el-form-item>
      <el-form-item v-if="!resetToken" prop="code" :rules="rules">
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
      <el-form-item v-if="resetToken" prop="password" :rules="passwordRules">
        <OInput
          v-model="form.password"
          :placeholder="i18n.INTER_PWD"
          type="password"
          show-password
        />
      </el-form-item>
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
  margin-bottom: 24px;
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
</style>
