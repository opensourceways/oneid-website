<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import { reactive, ref, toRefs } from 'vue';
import { EMAIL_REG, PHONE_REG } from 'shared/const/common.const';
import CountdownButton from './CountdownButton.vue';
import { OInput, useMessage, ODialog, DialogActionT, OForm, OFormItem } from '@opensig/opendesign';
import { RulesT, ValidatorT } from '@opensig/opendesign/lib/form/types';
import {
  getVerifyImgSize,
} from 'shared/utils/utils';
import {
  getUsernammeRules, validatorEmail, validatorEmpty, validatorPhone, formValidator, getCodeRules
} from 'shared/utils/rules';
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

const formRef = ref<InstanceType<typeof OForm>>();
const verify = ref();

// 表单值
const form = reactive({
  username: '',
  email: '',
  phone: '',
  code: '',
} as any);
// 用户名校验
const userNameRules = reactive<RulesT[]>(getUsernammeRules());

const codeRules = reactive<RulesT[]>(getCodeRules());
// 邮箱校验
const emailRules = reactive<RulesT[]>([
  {
    validator: validatorEmpty('ENTER_YOUR_EMAIL'),
    triggers: 'change',
  },
  {
    validator: validatorEmail,
    triggers: 'change',
  },
]);
// 手机校验
const phoneRules = reactive<RulesT[]>([
  {
    validator: validatorEmpty('ENTER_YOUR_PHONE'),
    triggers: 'change',
  },
  {
    validator: validatorPhone,
    triggers: 'change',
  },
]);

// 验证码限制重发
const disableCode = ref(true);
// 获取验证码
const getcode = (field: string) => {
  formValidator(formRef.value, field).subscribe((valid) => {
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
    modifyUser({ username: form.username, community: import.meta.env?.VITE_COMMUNITY })
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

const putUser = (formEl: InstanceType<typeof OForm> | undefined) => {
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
    variant: 'outline',
    onClick: () => {
      cancelPad();
    },
  },
  {
    id: 'ok',
    label: i18n.value.CONFIRM,
    variant: 'outline',
    size: 'large',
    onClick: () => {
      putUser(formRef.value);
    },
  },
];
// 账户失焦，判断发送验证码按钮是否禁用
const blurAccount = (formEl: InstanceType<typeof OForm> | undefined) => {
  if (!form.account) {
    disableCode.value = true;
  } else {
    formValidator(formEl, 'phone').subscribe((valid) => {
      disableCode.value = !valid;
    });
  }
};
</script>
<template>
  <!-- <ODialog v-model:visible="modelValue" :actions="dlgAction" hideClose :maskClose="false"> -->
<div class="perfect-info">
    <div class="perfect-info-head">
        <div class="head-logo"></div>
        <div class="head-title">{{ i18n.ENTER_USERINFO }}</h5>
    </div>
    <OForm
    ref="formRef"
    label-width="0"
    :model="form"
    class="form"
    @submit.prevent=""
    >
    <OFormItem v-if="!username" prop="username" :rules="userNameRules">
        <OInput
        v-model.trim="form.username"
        :placeholder="i18n.ENTER_USERNAME"
        />
    </OFormItem>
    <OFormItem v-if="!phoneExist" prop="phone" :rules="phoneRules">
        <OInput
        v-model.trim="form.phone"
        :placeholder="i18n.ENTER_YOUR_PHONE"
        @blur="blurAccount(formRef)"
        />
    </OFormItem>
    <OFormItem v-if="!phoneExist" prop="code" :rules="codeRules">
        <div class="code">
        <OInput
            v-model.trim="form.code"
            :placeholder="i18n.ENTER_RECEIVED_CODE"
            maxlength="6"
        >
            <template #suffix>
            <CountdownButton
                color="primary"
                v-model="disableCode"
                @click="getcode('phone')"
                size="small"
            />
            </template>
        </OInput>
        </div>
    </OFormItem>
    <OFormItem v-if="!emailExist" prop="email" :rules="emailRules">
        <OInput
        v-model.trim="form.email"
        :placeholder="i18n.ENTER_YOUR_EMAIL"
        />
    </OFormItem>
    <OFormItem v-if="!emailExist" prop="code" :rules="codeRules">
        <div class="code">
        <OInput
            v-model.trim="form.code"
            :placeholder="i18n.ENTER_RECEIVED_CODE"
            maxlength="6"
        >
            <template #suffix>
            <CountdownButton
                color="primary"
                v-model="disableCode"
                @click="getcode('email')"
                size="small"
            />
            </template>
        </OInput>
        </div>
    </OFormItem>
    </OForm>
    <div class="perfect-info-footer"></div>
 </div>
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
