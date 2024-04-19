<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import { reactive, ref } from 'vue';
import { OInput, OButton, useMessage, OForm, OFormItem } from '@opensig/opendesign';
import { EMAIL_REG, PHONE_REG } from 'shared/const/common.const';
import CountdownButton from './CountdownButton.vue';
import { resetPwd, resetPwdVerify, sendCodeCaptcha } from 'shared/api/api-login';
import { getVerifyImgSize } from 'shared/utils/utils';
import { getPwdRules, validatorEmpty, formValidator } from 'shared/utils/rules';
import Verify from 'shared/verifition/Verify.vue';
import { useCommonData } from 'shared/stores/common';
import { getRsaEncryptWord } from 'shared/utils/rsa';
import { useRoute, useRouter } from 'vue-router';
import { RulesT, ValidatorT } from '@opensig/opendesign/lib/form/types';

const { loginParams } = useCommonData();
const i18n = useI18n();
const message = useMessage();

const router = useRouter();
const route = useRoute();
const goLogin = () => {
  router.push({
    path: '/login',
    query: route.query,
  });
};

const formRef = ref<InstanceType<typeof OForm>>();
// 表单值
const form = reactive({
  account: '',
  code: '',
  password: '',
  confirmPwd: '',
} as any);

const requiredRules: RulesT[] = [
  {
    validator: validatorEmpty,
    triggers: 'blur',
  },
];
const rules = ref(requiredRules);
// 手机或邮箱合法校验
const validatorAccount: ValidatorT = (value: string) => {
  if (value) {
    if (!EMAIL_REG.test(value) && !PHONE_REG.test(value)) {
      return {
        type: 'danger',
        message: i18n.value.ENTER_VAILD_EMAIL_OR_PHONE,
      };
    }
  }
};

// 账户校验
const accountRules = reactive<RulesT[]>([
  ...requiredRules,
  {
    validator: validatorAccount,
    triggers: 'blur',
  },
]);
const passwordRules = ref<RulesT[]>([...requiredRules, ...getPwdRules()]);

// 确认密码校验
const validatorConfirmPwd: ValidatorT = (value: string) => {
  if (value !== form.password) {
    return {
      type: 'danger',
      message: i18n.value.CONFIRM_NOT_MATCH_PWD,
    };
  }
};
const confirmPwdRules = reactive<RulesT[]>([
  ...requiredRules,
  {
    validator: validatorConfirmPwd,
    triggers: ['change', 'blur'],
  },
]);

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
  const param = {
    channel: 'channel_reset_password',
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
// 获取到重置token
const resetToken = ref('');
const nextStep = (formEl: InstanceType<typeof OForm> | undefined) => {
  if (!formEl) return;
  formValidator(formEl).subscribe((valid) => {
    if (valid) {
      const param = {
        client_id: loginParams.value.client_id,
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
const confirm = (formEl: InstanceType<typeof OForm> | undefined) => {
  if (!formEl) return;
  formValidator(formEl).subscribe(async (valid) => {
    if (valid) {
      const newPwd = await getRsaEncryptWord(form.password);
      const param = {
        client_id: loginParams.value.client_id,
        pwd_reset_token: resetToken.value,
        new_pwd: newPwd,
      };
      resetPwd(param)
        .then(() => {
          message.success({
            content: i18n.value.RESET_SUCCESS,
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
  <OForm
    ref="formRef"
    label-width="0"
    :model="form"
    class="form"
    @submit.prevent=""
  >
    <span v-if="!resetToken">
      <OFormItem field="account" :rules="accountRules">
        <OInput
          v-model="form.account"
          size="large"
          :placeholder="i18n.ENTER_YOUR_EMAIL_OR_PHONE"
          @input="formRef?.resetFields('code')"
        />
      </OFormItem>
      <OFormItem field="code" :rules="rules">
        <OInput v-model="form.code" size="large" :placeholder="i18n.ENTER_RECEIVED_CODE">
          <template #suffix>
            <CountdownButton
              v-model="disableCode"
              @click="getcode(formRef)"
              size="small"
            />
          </template>
        </OInput>
      </OFormItem>
    </span>
    <span v-else>
      <OFormItem field="password" :rules="passwordRules">
        <OInput
          v-model="form.password"
          size="large"
          :placeholder="i18n.INTER_NEW_PWD"
          type="password"
        />
      </OFormItem>
      <OFormItem field="confirmPwd" :rules="confirmPwdRules">
        <OInput
          v-model="form.confirmPwd"
          size="large"
          :placeholder="i18n.CONFIRM_NEW_PWD"
          type="password"
        />
      </OFormItem>
    </span>
  </OForm>
  <div class="footer">
    <OButton size="large" @click="goLogin">
      {{ i18n.RETURN_LOGIN }}
    </OButton>
    <OButton
      v-if="!resetToken"
      size="large"
      type="primary"
      @click="nextStep(formRef)"
    >
      {{ i18n.NEXT_STEP }}
    </OButton>
    <OButton v-else size="large" type="primary" @click="confirm(formRef)">
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
.o-input {
  width: 100%;
}
.header {
  @include h1;
  font-weight: 600;
  color: var(--o-color-info1);
  text-align: center;
  padding-bottom: 28px;
}
.footer {
  display: flex;
  justify-content: center;
  column-gap: var(--o-spacing-h5);
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
