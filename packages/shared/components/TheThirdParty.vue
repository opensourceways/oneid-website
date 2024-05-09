<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted, reactive, ref } from 'vue';
import { bindByThirdparty, loginByThirdparty, registerByThirdparty } from '../api/api-thirdparty';
import {
  getSessionStorage,
  asyncBlur,
  formValidator,
  getVerifyImgSize,
} from '../utils/utils';
import { useI18n } from '../i18n';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { EMAIL_REG, PHONE_REG } from '../const/common.const';
import CountdownButton from '../components/CountdownButton.vue';
import Verify from '../verifition/Verify.vue';
import { accountLoginPost, sendCodeCaptcha } from '../api/api-login';

const route = useRoute();
const tParam = ref<any>({});
const isBind = ref(false);
const i18n = useI18n();

// 绑定界面
const showBind = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({
  account: '',
  code: '',
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
  const channel = 'CHANNEL_LOGIN';
  const param = {
    community: import.meta.env?.VITE_COMMUNITY,
    channel,
    account: form.account,
    captchaVerification: data.captchaVerification,
  };
  sendCodeCaptcha(param).then(() => {
    disableCode.value = true;
    disableCodeInput.value = false;
    ElMessage.success({
      showClose: true,
      message: i18n.value.SEND_SUCCESS,
    });
  });
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
const blur = (formEl: FormInstance | undefined, field: string) => {
  asyncBlur(formEl, field);
};

const bindToken = ref('');
const getParam = () => {
  try {
    const str = getSessionStorage('TP_PARAM') || '';
    tParam.value = JSON.parse(str) || {};
  } catch (error) {
    tParam.value = {};
  }
  try {
    const str = getSessionStorage('TP_BIND') || '';
    isBind.value = str === 'true';
  } catch (error) {
    isBind.value = false;
  }
};
const loginSuccess = () => {
  const data = {
    type: 'authorization_response',
    response: 'success',
  };
  window.opener.postMessage(data, location.href);
};
const login = () => {
  if (route.params.id && route.query.code && tParam.value.client_id) {
    const param = {
      code: route.query.code as string,
      state: route.query.state as string,
      client_id: tParam.value.client_id,
    };
    loginByThirdparty(route.params.id as string, param)
      .then((data) => {
        loginSuccess();
      })
      .catch((err) => {
        if (err?.response?.data?.code === 404) {
          bindToken.value = err?.response?.data?.data || '';
          if (isBind.value) {
            bindAccountSuccess();
          }
        }
      });
  }
};
onMounted(() => {
  getParam();
  login();
});

const backBind = () => {
  showBind.value = false;
  disableCode.value = false;
  formRef.value?.resetFields();
};

const register = () => {
  const param = {
    register_token: bindToken.value,
    client_id: tParam.value.client_id,
    state: route.query.state as string,
  };
  registerByThirdparty(param).then(() => {
    loginSuccess();
  });
};

const bindAccount = () => {
  const param = {
    accept_term: 0,
    account: form.account,
    code: form.code,
    community: import.meta.env?.VITE_COMMUNITY,
    client_id: tParam.value.client_id,
  }
  accountLoginPost(param).then(() => {
    bindAccountSuccess();
  });
}
const bindAccountSuccess = () => {
  const bindParams = {
    bind_token: bindToken.value,
    state: route.query.state as string,
  }
  bindByThirdparty(bindParams).then(() => {
    loginSuccess();
  })
}
</script>
<template>
  <div v-if="bindToken && !isBind" class="third-login">
    <div class="third-login-main">
      <template v-if="!showBind">
        <OButton
          style="margin-bottom: 24px"
          type="primary"
          class="login-btn"
          @click="showBind = true"
        >
          {{ i18n.BIND_EXIST_ACCOUNT }}
        </OButton>
        <OButton type="primary" class="login-btn" @click="register">
          {{ i18n.CREATE_ACCOUNT }}
        </OButton>
      </template>
      <template v-else>
        <a style="font-size: 14px" @click="backBind">
          &lt;&nbsp; {{ i18n.BACK }}
        </a>
        <el-form
          ref="formRef"
          label-width="0"
          :model="form"
          style="max-width: 460px; margin-top: 24px"
        >
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
                :disabled="disableCodeInput"
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
          <el-form-item>
            <OButton type="primary" class="login-btn" @click="bindAccount">
              {{ i18n.IDENTITY }}
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
    </div>
  </div>
</template>
<style lang="scss" scoped>
.third-login {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-color: var(--o-color-bg1);

  .third-login-main {
    width: 420px;
    margin: 0 auto;
    padding: var(--o-spacing-h2);
    background-color: var(--o-color-text2);
    box-shadow: var(--o-shadow-l1);
  }
}
.login-btn {
  width: 100%;
  justify-content: center;
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
</style>
