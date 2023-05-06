<script setup lang="ts">
import { bindAccount, modifyUser, sendCode } from 'shared/api/api-center';
import { accountExists, accountLogin, queryToken } from 'shared/api/api-login';
import CountdownButton from 'shared/components/CountdownButton.vue';
import { useI18n } from 'shared/i18n';
import { EMAIL_REG } from 'shared/const/common.const';
import {
  getLogoutSession,
  isLogined,
  logout,
  setLogoutSession,
} from 'shared/utils/login';
import {
  callBackErrMessage,
  formValidator,
  asyncBlur,
  getVerifyImgSize,
  getFitWidth,
} from 'shared/utils/utils';
import { getUsernammeRules } from '@/shared/utils';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { mergeMap, Observable, of, zip, map } from 'rxjs';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { haveLoggedIn } from 'shared/utils/login-success';
import { validLoginUrl } from 'shared/utils/login-valid-url';
import { useCommonData } from 'shared/stores/common';
import Verify from '@/verifition/Verify.vue';

const formRef = ref<FormInstance>();
const i18n = useI18n();
const loginTemplate = ref<any>(null);
const visible = ref(false);
const router = useRouter();
const route = useRoute();
const goRegister = () => {
  router.push({
    path: '/register',
    query: route.query,
  });
};
const verify = ref();
const { loginParams } = useCommonData();
onMounted(() => {
  validLoginUrl().then(() => {
    isLogined().then((bool) => {
      if (bool) {
        if (isNotPadUserinfo(bool)) {
          haveLoggedIn();
        }
      } else if (!getLogoutSession()) {
        setLogoutSession(true);
        window.location.href = `https://jldibemigdfj.authing.cn/login/profile/logout?app_id=${
          loginParams.value.client_id
        }&redirect_uri=${location.href.replaceAll('&', '%26')}`;
      }
    });
  });
});
const login = (form: any) => {
  const param = {
    community: 'openeuler',
    permission: 'sigRead',
    account: form.account,
    code: form.code,
    client_id: loginParams.value.client_id,
  };
  accountLogin(param).then((data: any) => {
    loginSuccess(data?.data);
  });
};
const threePartLogin = (res: any) => {
  const { code, redirect_uri } = res;
  const param = {
    code: code,
    permission: 'sigRead',
    community: 'openeuler',
    redirect: redirect_uri,
    client_id: loginParams.value.client_id,
  };
  queryToken(param).then((data: any) => {
    loginSuccess(data?.data);
  });
};
// 表单值
const form = reactive({
  username: '',
  email: '',
  code: '',
} as any);
// 用户名校验
const userNameRules = reactive<FormItemRule[]>(getUsernammeRules());

// 邮箱重名校验
const validatorSameAccount = (rule: any, value: any): void | Promise<void> => {
  if (value) {
    return new Promise((resolve, reject) => {
      accountExists({ account: value, client_id: loginParams.value.client_id })
        .then(() => {
          resolve();
        })
        .catch((err: any) => {
          reject(callBackErrMessage(err));
        });
    });
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
// 邮箱校验
const emailRules = reactive<FormItemRule[]>([
  ...requiredRules,
  {
    pattern: EMAIL_REG,
    message: i18n.value.ENTER_VAILD_EMAIL,
    trigger: 'blur',
  },
  {
    asyncValidator: validatorSameAccount,
    trigger: 'none',
  },
]);

// 验证码限制重发
const disableCode = ref(false);
// 获取验证码
const getcode = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl, 'email').subscribe((valid) => {
    if (valid) {
      verify.value.show();
    } else {
      return false;
    }
  });
};
const verifySuccess = (data: any) => {
  const param = {
    account: form.email,
    channel: 'channel_bind_email',
    captchaVerification: data.captchaVerification,
  };
  sendCode(param).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.SEND_SUCCESS,
    });
    disableCode.value = true;
  });
};
const putUser = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl)
    .pipe(
      mergeMap((bool) => {
        if (bool) {
          return zip(putUserName(), putEmail()).pipe(
            map((value) => value.reduce((pre, next) => pre && next))
          );
        }
        return of(false);
      })
    )
    .subscribe((data) => {
      if (data) {
        doSuccess();
      }
    });
};

// 补全用户名
const putUserName = () => {
  return new Observable((observer) => {
    if (padUserinfo.username) {
      observer.next(true);
      observer.complete();
      return;
    }
    modifyUser({ username: form.username })
      .then(() => {
        observer.next(true);
        observer.complete();
      })
      .catch(() => {
        observer.next(false);
        observer.complete();
      });
  });
};

// 补全邮箱
const putEmail = () => {
  return new Observable((observer) => {
    if (padUserinfo.email_exist) {
      observer.next(true);
      observer.complete();
      return;
    }
    const param = {
      account_type: 'email',
      account: form.email,
      code: form.code,
    };
    bindAccount(param)
      .then(() => {
        observer.next(true);
        observer.complete();
      })
      .catch(() => {
        observer.next(false);
        observer.complete();
      });
  });
};

// 控制补全框内容
const padUserinfo = reactive({
  username: '',
  email_exist: false,
});

// 判断是否需要补全内容
const isNotPadUserinfo = (data: any): boolean => {
  // const { username, email_exist = false, email = '' } = data || {};
  const { username, email_exist = true } = data || {};
  const name = !username || username.startsWith('oauth2_') ? '' : username;
  // const hasEmail = Boolean(email_exist || email);
  const hasEmail = Boolean(email_exist);
  if (!name || !hasEmail) {
    padUserinfo.username = name;
    padUserinfo.email_exist = hasEmail;
    visible.value = true;
    return false;
  }
  return true;
};

// 登录成功处理函数
const loginSuccess = (data: any) => {
  if (isNotPadUserinfo(data)) {
    doSuccess();
  }
};
// 登录成功提示
const doSuccess = () => {
  ElMessage.success({
    showClose: true,
    message: i18n.value.LOGIN_SUCCESS,
  });
  setLogoutSession();
  haveLoggedIn();
};
const cancelPad = () => {
  if (loginParams.value.response_mode === 'query') {
    logout();
  } else {
    doSuccess();
  }
};
</script>
<template>
  <LoginTemplate
    ref="loginTemplate"
    @submit="login"
    @three-part-login="threePartLogin"
  >
    <template #switch>
      {{ i18n.NO_ACCOUNT }}
      &nbsp;
      <a @click="goRegister">{{ i18n.REGISTER_NOW }}</a>
    </template>
    <template #headerTitle> {{ i18n.ACCOUNT_LOGIN }} </template>
    <template #btn> {{ i18n.LOGIN }} </template>
  </LoginTemplate>
  <el-dialog
    v-model="visible"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :width="getFitWidth(420)"
  >
    <template #header>
      <h5 class="header">{{ i18n.ENTER_USERINFO }}</h5>
    </template>
    <el-form
      ref="formRef"
      label-width="0"
      :model="form"
      class="form"
      @submit.prevent=""
    >
      <el-form-item
        v-if="!padUserinfo.username"
        prop="username"
        :rules="userNameRules"
      >
        <OInput
          v-model.trim="form.username"
          :placeholder="i18n.ENTER_USERNAME"
          @blur="asyncBlur(formRef, 'username')"
        />
      </el-form-item>
      <el-form-item
        v-if="!padUserinfo.email_exist"
        prop="email"
        :rules="emailRules"
      >
        <OInput
          v-model.trim="form.email"
          :placeholder="i18n.ENTER_YOUR_EMAIL"
          @blur="asyncBlur(formRef, 'email')"
        />
      </el-form-item>
      <el-form-item v-if="!padUserinfo.email_exist" prop="code" :rules="rules">
        <div class="code">
          <OInput v-model.trim="form.code" :placeholder="i18n.ENTER_RECEIVED_CODE" />
          <CountdownButton
            v-model="disableCode"
            class="btn"
            size="small"
            @click="getcode(formRef)"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="footer">
        <OButton size="small" @click="cancelPad">{{
          loginParams.response_mode === 'query' ? i18n.LOGOUT : i18n.CANCEL
        }}</OButton>
        <OButton size="small" type="primary" @click="putUser(formRef)">{{
          i18n.CONFIRM
        }}</OButton>
      </div>
    </template>
    <Verify
      ref="verify"
      mode="pop"
      captcha-type="blockPuzzle"
      :img-size="getVerifyImgSize()"
      @success="verifySuccess"
    ></Verify>
  </el-dialog>
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
.footer {
  display: flex;
  justify-content: center;
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
