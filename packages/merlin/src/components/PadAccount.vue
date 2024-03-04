<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import { reactive, ref, toRefs } from 'vue';
import { FormInstance, FormItemRule } from 'element-plus';
import { EMAIL_REG, PHONE_REG } from 'shared/const/common.const';
import CountdownButton from './CountdownButton.vue';
import { OInput, useMessage, ODialog, DialogActionT } from '@opensig/opendesign';
import {
  formValidator,
  getUsernammeRules,
  getVerifyImgSize,
  asyncBlur,
} from 'shared/utils/utils';
import Verify from 'shared/verifition/Verify.vue';
import { useCommonData } from 'shared/stores/common';
import { bindAccount, modifyUser, sendCode } from 'shared/api/api-center';
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
  emailExist: {
    type: Boolean,
    default: true,
  },
  phoneExist: {
    type: Boolean,
    default: true,
  },
});
const { modelValue, username, emailExist, phoneExist } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'cancel', 'success']);
const { loginParams } = useCommonData();
const i18n = useI18n();
const message = useMessage();

const formRef = ref<FormInstance>();
const verify = ref();

// 表单值
const form = reactive({
  username: '',
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
  sendCode(param).then(() => {
    message.success({
      content: i18n.value.SEND_SUCCESS,
    });
    disableCode.value = true;
  });
};

// 补全用户名
const putUserName = () => {
  return new Observable((observer) => {
    if (username.value) {
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
const dlgAction: DialogActionT[] = [
  {
    id: 'cancel',
    label: loginParams.value.response_mode === 'query' || !username
            ? i18n.value.LOGOUT
            : i18n.value.CANCEL,
    size: 'large',
    onClick: () => {
      cancelPad();
    },
  },
  {
    id: 'ok',
    label: i18n.value.CONFIRM,
    color: 'primary',
    variant: 'solid',
    size: 'large',
    onClick: () => {
      putUser(formRef.value);
    },
  },
];
</script>
<template>
  <ODialog v-model:visible="modelValue" :actions="dlgAction">
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
            @blur="asyncBlur(formRef, 'code')"
          />
          <CountdownButton
            v-model="disableCode"
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
            @blur="asyncBlur(formRef, 'code')"
          />
          <CountdownButton
            v-model="disableCode"
            @click="getcode(formRef, 'email')"
          />
        </div>
      </el-form-item>
    </el-form>
  </ODialog>
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
.o-input {
  width: 100%;
}
.code {
  display: grid;
  grid-template-columns: auto max-content;
  width: 100%;
  grid-gap: 6px;
}
</style>
