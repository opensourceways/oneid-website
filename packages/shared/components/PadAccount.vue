<script setup lang="ts">
import { useI18n } from '../i18n';
import { reactive, ref, toRefs } from 'vue';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { EMAIL_REG, PHONE_REG } from '../const/common.const';
import CountdownButton from './CountdownButton.vue';
import {
  formValidator,
  getFitWidth,
  getUsernammeRules,
  getVerifyImgSize,
  asyncBlur,
  getCompanyRules,
} from '../utils/utils';
import Verify from '../verifition/Verify.vue';
import { useCommonData } from '../stores/common';
import { bindAccount, modifyUser, sendCode, sendCodePost } from '../api/api-center';
import { mergeMap, Observable, of, zip, map } from 'rxjs';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  // 控制补全框内容
  username: {
    type: String,
    default: '',
  },
  companyExist: {
    type: Boolean,
    default: true,
  },
  emailExist: {
    type: Boolean,
    default: true,
  },
  phoneExist: {
    type: Boolean,
    default: true,
  },
});
const { modelValue, username, companyExist, emailExist, phoneExist } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'cancel', 'success']);
const { loginParams } = useCommonData();
const i18n = useI18n();

const formRef = ref<FormInstance>();
const verify = ref();

// 表单值
const form = reactive({
  username: '',
  company: '',
  email: '',
  phone: '',
  code: '',
} as any);
// 用户名校验
const userNameRules = reactive<FormItemRule[]>(getUsernammeRules());

// 空值校验
const requiredRules: FormItemRule[] = [
  {
    required: true,
    message: i18n.value.NOT_EMPTY,
    trigger: 'blur',
  },
];

// 公司校验
const companyRules = reactive<FormItemRule[]>([
  ...requiredRules,
  ...getCompanyRules(),
]);
const rules = ref(requiredRules);
// 邮箱校验
const emailRules = reactive<FormItemRule[]>([
  ...requiredRules,
  {
    pattern: EMAIL_REG,
    message: i18n.value.ENTER_VAILD_EMAIL,
    trigger: 'blur',
  },
]);
// 手机校验
const phoneRules = reactive<FormItemRule[]>([
  ...requiredRules,
  {
    pattern: PHONE_REG,
    message: i18n.value.ENTER_VAILD_PHONE,
    trigger: 'blur',
  },
]);

// 验证码限制重发
const disableCode = ref(false);
// 获取验证码
const getcode = (formEl: FormInstance | undefined, field: string) => {
  if (!formEl) return;
  formValidator(formEl, field).subscribe((valid) => {
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
  if (!phoneExist.value) {
    param.account = form.phone;
    param.channel = 'channel_bind_phone';
  }
  const sendCodeApi = import.meta.env?.VITE_COMMUNITY === 'openeuler' ? sendCodePost : sendCode;
  sendCodeApi(param).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.SEND_SUCCESS,
    });
    disableCode.value = true;
  });
};

// 补全用户名
const putUserName = () => {
  return new Observable((observer) => {
    if (username.value && companyExist.value) {
      observer.next(true);
      observer.complete();
      return;
    }
    let param;
    if (import.meta.env?.VITE_COMMUNITY === 'opengauss') {
      param = {
        community: import.meta.env?.VITE_COMMUNITY,
        client_id: loginParams.value.client_id,
      }
    }
    const info = {};
    if (form.username) {
      Object.assign(info, { username: form.username })
    }
    if (form.company) {
      Object.assign(info, { company: form.company })
    }
    modifyUser(info, param)
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
    if (emailExist.value && phoneExist.value) {
      observer.next(true);
      observer.complete();
      return;
    }
    const param = {
      account_type: 'email',
      account: form.email,
      code: form.code,
    };
    if (!phoneExist.value) {
      param.account = form.phone;
      param.account_type = 'phone';
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

const close = () => {
  emit('update:modelValue', false);
  formRef.value?.resetFields();
};

const doSuccess = () => {
  emit('success');
  close();
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

const cancelPad = () => {
  emit('cancel');
  close();
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
      <h5 class="header">{{ i18n.ENTER_USERINFO }}</h5>
    </template>
    <el-form
      ref="formRef"
      label-width="0"
      :model="form"
      class="form"
      @submit.prevent=""
    >
      <el-form-item v-if="!username" prop="username" :rules="userNameRules">
        <OInput
          v-model.trim="form.username"
          :placeholder="i18n.ENTER_USERNAME"
          @blur="asyncBlur(formRef, 'username')"
        />
      </el-form-item>
      <el-form-item v-if="!companyExist" prop="company" :rules="companyRules">
        <OInput
          v-model.trim="form.company"
          :placeholder="i18n.ENTER_COMPANY"
          @blur="asyncBlur(formRef, 'company')"
        />
      </el-form-item>
      <el-form-item v-if="!phoneExist" prop="phone" :rules="phoneRules">
        <OInput
          v-model.trim="form.phone"
          :placeholder="i18n.ENTER_YOUR_PHONE"
          @blur="asyncBlur(formRef, 'phone')"
        />
      </el-form-item>
      <el-form-item v-if="!phoneExist" prop="code" :rules="rules">
        <div class="code">
          <OInput
            v-model.trim="form.code"
            :placeholder="i18n.ENTER_RECEIVED_CODE"
            maxlength="6"
          />
          <CountdownButton
            v-model="disableCode"
            class="btn"
            size="small"
            @click="getcode(formRef, 'phone')"
          />
        </div>
      </el-form-item>
      <el-form-item v-if="!emailExist" prop="email" :rules="emailRules">
        <OInput
          v-model.trim="form.email"
          :placeholder="i18n.ENTER_YOUR_EMAIL"
          @blur="asyncBlur(formRef, 'email')"
        />
      </el-form-item>
      <el-form-item v-if="!emailExist" prop="code" :rules="rules">
        <div class="code">
          <OInput
            v-model.trim="form.code"
            :placeholder="i18n.ENTER_RECEIVED_CODE"
            maxlength="6"
          />
          <CountdownButton
            v-model="disableCode"
            class="btn"
            size="small"
            @click="getcode(formRef, 'email')"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="footer">
        <OButton size="small" @click="cancelPad">{{
          loginParams.response_mode === 'query' || !username
            ? i18n.LOGOUT
            : i18n.CANCEL
        }}</OButton>
        <OButton size="small" type="primary" @click="putUser(formRef)">{{
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
