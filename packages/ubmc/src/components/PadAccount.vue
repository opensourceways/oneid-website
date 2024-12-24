<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import { reactive, ref, toRefs } from 'vue';
import CountdownButton from './CountdownButton.vue';
import {
  OInput,
  useMessage,
  ODialog,
  OForm,
  OFormItem,
  OButton,
} from '@opensig/opendesign';
import { RulesT } from '@opensig/opendesign/lib/form/types';
import { getVerifyImgSize } from 'shared/utils/utils';
import {
  getUsernammeRules,
  validatorEmail,
  validatorEmpty,
  validatorPhone,
  formValidator,
  getCodeRules,
} from 'shared/utils/rules';
import Verify from 'shared/verifition/Verify.vue';
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
    modifyUser({
      username: form.username,
      community: import.meta.env?.VITE_COMMUNITY,
    })
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
    }
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

const putUser = () => {
  const formEl = formRef.value;
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
  <ODialog
    v-model:visible="modelValue"
    hideClose
    class="dialog"
    :style="{ '--dlg-body-padding': '58px', '--dlg-padding-body-bottom': '0', '--dlg-width': '480px' }"
    :maskClose="false"
  >
    <template #header>
      <div class="header">{{ i18n.ENTER_USERINFO }}</div>
    </template>
    <OForm
      ref="formRef"
      label-width="0"
      :model="form"
      class="form"
      @submit.prevent=""
    >
      <OFormItem v-if="!username" field="username" :rules="userNameRules">
        <OInput
          v-model.trim="form.username"
          size="large"
          :placeholder="i18n.ENTER_USERNAME"
        />
      </OFormItem>
      <OFormItem v-if="!phoneExist" prop="phone" :rules="phoneRules">
        <OInput
          v-model.trim="form.phone"
          size="large"
          :placeholder="i18n.ENTER_YOUR_PHONE"
          @blur="blurAccount(formRef)"
        />
      </OFormItem>
      <OFormItem v-if="!phoneExist" prop="code" :rules="codeRules">
        <div class="code">
          <OInput
            v-model.trim="form.code"
            size="large"
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
          size="large"
          :placeholder="i18n.ENTER_YOUR_EMAIL"
        />
      </OFormItem>
      <OFormItem v-if="!emailExist" prop="code" :rules="codeRules">
        <div class="code">
          <OInput
            v-model.trim="form.code"
            size="large"
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
    <template #footer>
      <div class="footer">
        <OButton size="large" color="primary" class="btn mr24" @click="cancelPad">{{ i18n.LOGOUT }}</OButton>
        <OButton size="large" color="primary" class="btn primary" @click="putUser">{{ i18n.CONFIRM }}</OButton>
      </div>
    </template>
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
.dialog {
  .header {
    font-size: var(--o-font_size-h2);
    line-height: 32px;
    color: #000;
  }
  .footer {
    text-align: center;
    .btn.primary {
      color: white;
      background-color: var(--o-color-primary1);
    }
    .btn {
      color: var(--o-color-primary1);
      &:hover {
        color: inherit;
        background-color: inherit;
      }
    }
  }
  .mr24 {
    margin-right: 24px;
  }
}

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
  :deep(.o-input-large) {
    --input-padding: 0 16px;
  }
}
</style>
