<script setup lang="ts">
import ContentTemplate from './ContentTemplate.vue';
import CountdownButton from 'shared/components/CountdownButton.vue';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { PropType, reactive, ref, toRefs } from 'vue';
import { useI18n } from 'shared/i18n';
import {
  formValidator,
  doValidatorForm,
  asyncBlur,
  getCompanyRules,
} from 'shared/utils/utils';
import { accountExists, sendCodeV3 } from 'shared/api/api-login';
import Verify from '@/verifition/Verify.vue';
import { callBackErrMessage } from 'shared/utils/utils';
import { getUsernammeRules } from '@/shared/utils';
import { EMAIL_REG, PHONE_REG } from 'shared/const/common.const';
import { useCommonData } from 'shared/stores/common';
import { getCommunityParams } from '@/shared/utils';

type TYPE = 'login' | 'register';
const props = defineProps({
  type: {
    type: String as PropType<TYPE>,
    default: 'login',
  },
});

const emit = defineEmits(['submit']);

const { type } = toRefs(props);
const i18n = useI18n();
const { lang } = useCommonData();
const formRef = ref<FormInstance>();
// 表单值
const form = reactive({
  username: '',
  account: '',
  code: '',
  company: '',
  policy: [],
} as any);

// 验证码限制重发
const disableCode = ref(false);
const verify = ref();
// 获取验证码
const getcode = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl, ['account', 'username', 'company']).subscribe(
    (valid) => {
      if (valid) {
        verify.value.show();
      } else {
        return false;
      }
    }
  );
};

const verifySuccess = (data: any) => {
  const param = {
    ...getCommunityParams(),
    channel: type.value === 'login' ? 'CHANNEL_LOGIN' : 'CHANNEL_REGISTER',
    account: form.account,
    captchaVerification: data.captchaVerification,
  };
  sendCodeV3(param).then(() => {
    disableCode.value = true;
    ElMessage.success({
      showClose: true,
      message: i18n.value.SEND_SUCCESS,
    });
  });
};

const changeCheckBox = (formEl: FormInstance | undefined) => {
  if (form.policy.length) {
    form.policy = [];
  } else {
    form.policy.push('1');
  }
  doValidatorForm(formEl, 'policy');
};

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
// 手机或邮箱重名校验
const validatorSameAccount = (rule: any, value: any): void | Promise<void> => {
  if (value) {
    return new Promise((resolve, reject) => {
      accountExists({ account: value, ...getCommunityParams(true) })
        .then(() => {
          resolve();
        })
        .catch((err: any) => {
          reject(callBackErrMessage(err));
        });
    });
  }
};
// 手机或邮箱是否存在校验
const validatorExistAccount = (rule: any, value: any): void | Promise<void> => {
  if (value) {
    return new Promise((resolve, reject) => {
      accountExists({ account: value, ...getCommunityParams(true) })
        .then(() => {
          reject(i18n.value.ACCOUNT_NOT_EXIST);
        })
        .catch(() => {
          resolve();
        });
    });
  }
};
// checkbox校验
const validatorCheckbox = (rule: any, value: any, callback: any) => {
  if (!value || !value.length) {
    callback(i18n.value.PLEASE_CHECK_PRIVACY);
  } else {
    callback();
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

// 用户名校验
const userNameRules = reactive<FormItemRule[]>(getUsernammeRules());

// 账户校验
const accountRules = reactive<FormItemRule[]>([
  ...requiredRules,
  {
    validator: validatorAccount,
    trigger: 'blur',
  },
  {
    asyncValidator:
      type.value === 'register' ? validatorSameAccount : validatorExistAccount,
    trigger: 'none',
  },
]);

// 公司校验
const companyRules = reactive<FormItemRule[]>([
  ...requiredRules,
  ...getCompanyRules(),
]);

// 隐私声明校验
const policyRules = reactive<FormItemRule[]>([
  {
    validator: validatorCheckbox,
    trigger: 'change',
  },
]);

const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl).subscribe((valid) => {
    if (valid) {
      emit('submit', form);
    } else {
      return false;
    }
  });
};

const blur = (formEl: FormInstance | undefined, field: string) => {
  if (type.value === 'register') {
    asyncBlur(formEl, field);
  }
};

// 隐私政策、法律声明
const goToOtherPage = (type: string) => {
  const origin = import.meta.env.VITE_OPENEULER_WEBSITE;
  const url = `${origin}/${lang.value}/${type}/`;
  window.open(url, '_blank');
};
</script>
<template>
  <ContentTemplate>
    <template #headerTitle>
      <slot name="headerTitle"> {{ i18n.ACCOUNT_LOGIN }} </slot>
    </template>
    <template #switch>
      <slot name="switch"></slot>
    </template>
    <template #body>
      <el-form
        ref="formRef"
        label-width="0"
        :model="form"
        style="max-width: 460px"
      >
        <span v-if="type === 'register'">
          <el-form-item prop="username" :rules="userNameRules">
            <OInput
              v-model="form.username"
              :placeholder="i18n.ENTER_USERNAME"
              @blur="blur(formRef, 'username')"
            />
          </el-form-item>
          <el-form-item prop="company" :rules="companyRules">
            <OInput v-model="form.company" :placeholder="i18n.ENTER_COMPANY" />
          </el-form-item>
          <el-form-item prop="account" :rules="accountRules">
            <OInput
              v-model="form.account"
              :placeholder="i18n.ENTER_YOUR_EMAIL_OR_PHONE"
              @blur="blur(formRef, 'account')"
            />
          </el-form-item>
          <el-form-item prop="code" :rules="rules">
            <div class="code">
              <OInput
                v-model="form.code"
                :placeholder="i18n.ENTER_RECEIVED_CODE"
              />
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
          <el-form-item prop="account" :rules="accountRules">
            <OInput
              v-model="form.account"
              :placeholder="i18n.ENTER_YOUR_EMAIL_OR_PHONE"
              @blur="blur(formRef, 'account')"
            />
          </el-form-item>
          <el-form-item prop="code" :rules="rules">
            <div class="code">
              <OInput
                v-model="form.code"
                :placeholder="i18n.ENTER_RECEIVED_CODE"
              />
              <CountdownButton
                v-model="disableCode"
                class="btn"
                size="small"
                @click="getcode(formRef)"
              />
            </div>
          </el-form-item>
        </span>
        <el-form-item prop="policy" :rules="policyRules">
          <div class="checkbox">
            <OCheckboxGroup
              v-model="form.policy"
              @change="doValidatorForm(formRef, 'policy')"
            >
              <OCheckbox value="1"></OCheckbox>
            </OCheckboxGroup>
            <span>
              <span class="cursor" @click="changeCheckBox(formRef)">
                {{ i18n.READ_ADN_AGREE }}
              </span>
              <span>&nbsp;</span>
              <a @click="goToOtherPage('privacyPolicy')">{{
                i18n.PRIVACY_POLICY
              }}</a>
              {{ i18n.AND }}
              <a @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</a>
            </span>
          </div>
        </el-form-item>
        <el-form-item>
          <OButton type="primary" class="login-btn" @click="submit(formRef)">
            <slot name="btn"> {{ i18n.LOGIN }} </slot>
          </OButton>
        </el-form-item>
      </el-form>
    </template>
  </ContentTemplate>
  <Verify
    ref="verify"
    mode="pop"
    captcha-type="blockPuzzle"
    :img-size="{ width: '400px', height: '200px' }"
    @success="verifySuccess"
  ></Verify>
</template>
<style lang="scss" scoped>
.gap {
  margin-left: var(--o-spacing-h2);
}
.icon {
  font-size: var(--o-font-size-h3);
  cursor: pointer;
}
.code {
  display: grid;
  grid-template-columns: auto max-content;
  width: 100%;
  grid-gap: var(--o-spacing-h9);
}
.cursor {
  cursor: pointer;
}
.btn {
  height: 38px;
}
.login-btn {
  width: 100%;
  justify-content: center;
}
.checkbox {
  display: grid;
  grid-template-columns: auto auto;
  align-items: start;
  color: var(--o-color-text1);
  font-size: var(--o-font-size-text);
  line-height: var(--o-line-height-text);
  .o-checkbox-group {
    padding-top: 3px;
  }
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
.el-form-item {
  margin-bottom: 24px;
}
:deep(.el-form-item__error--inline) {
  margin-left: 0 !important;
}
</style>
