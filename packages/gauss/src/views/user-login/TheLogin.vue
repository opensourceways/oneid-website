<script setup lang="ts">
import { bindAccount, modifyUser, sendCode } from 'shared/api/api-center';
import { accountExists, accountLogin } from 'shared/api/api-login';
import { useI18n } from 'shared/i18n';
import { EMAIL_REG } from 'shared/const/common.const';
import { isLogined, saveUserAuth } from 'shared/utils/login';
import {
  callBackErrMessage,
  getUsernammeRules,
  formValidator,
  asyncBlur,
} from 'shared/utils/utils';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { mergeMap, Observable, of, zip, map } from 'rxjs';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoginTemplate from './components/LoginTemplate.vue';
import { haveLoggedIn } from 'shared/utils/login-success';
import { WEB_COMMUNITY } from '@/shared/const';

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
onMounted(() => {
  isLogined().then((bool) => {
    if (bool) {
      haveLoggedIn();
    }
  });
});
const login = (form: any) => {
  const param = {
    community: WEB_COMMUNITY,
    permission: 'sigRead',
    account: form.account,
    code: form.code,
  };
  accountLogin(param).then((data: any) => {
    loginSuccess(data?.data);
  });
};
// 表单值
const form = reactive({
  userName: '',
  email: '',
  code: '',
} as any);
// 用户名校验
const userNameRules = reactive<FormItemRule[]>(getUsernammeRules());

// 邮箱重名校验
const validatorSameAccount = (rule: any, value: any): void | Promise<void> => {
  if (value) {
    return new Promise((resolve, reject) => {
      accountExists({ account: value })
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
      const param = {
        account_type: 'email',
        account: form.email,
        field: 'change',
      };
      sendCode(param).then(() => {
        ElMessage.success({
          showClose: true,
          message: i18n.value.SEND_SUCCESS,
        });
        disableCode.value = true;
      });
    } else {
      return false;
    }
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
    modifyUser({ username: form.userName })
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

// 登录成功处理函数
const loginSuccess = (data: any) => {
  const { token, username } = data || {};
  saveUserAuth(token);
  if (!username) {
    padUserinfo.username = username;
    visible.value = true;
    return;
  }
  doSuccess();
};
// 登录成功提示
const doSuccess = () => {
  ElMessage.success({
    showClose: true,
    message: i18n.value.LOGIN_SUCCESS,
  });
  haveLoggedIn();
};
</script>
<template>
  <LoginTemplate ref="loginTemplate" @submit="login">
    <template #switch>
      {{ i18n.NO_ACCOUNT }}
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
    width="450px"
  >
    <template #header>
      <h5 class="header">{{ i18n.ENTER_USERINFO }}</h5>
    </template>
    <el-form ref="formRef" label-width="0" :model="form" class="form">
      <el-form-item
        v-if="!padUserinfo.username"
        prop="userName"
        :rules="userNameRules"
      >
        <OInput
          v-model="form.userName"
          :placeholder="i18n.ENTER_USERNAME"
          @blur="asyncBlur(formRef, 'userName')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="footer">
        <OButton size="small" type="primary" @click="putUser(formRef)">{{
          i18n.CONFIRM
        }}</OButton>
      </div>
    </template>
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
.form {
  padding: 0 28px;
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
  margin-bottom: 24px;
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
</style>
