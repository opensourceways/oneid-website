<script setup lang="ts">
import { computed, reactive, ref, toRefs } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import { AccountDialogConfig, QueryCodeParams } from './interface';
import { ElMessage, FormInstance } from 'element-plus';
import { useCommonData } from 'shared/stores/common';
import { sendCode } from 'shared/api/api-center';
import CountdownButton from 'shared/components/CountdownButton.vue';
import { EMAIL_REG } from 'shared/const/common.const';
import Verify from '@/verifition/Verify.vue';

const i18n = useI18n();
const formRef = ref<FormInstance>();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  config: {
    type: Object,
    default: () => ({} as AccountDialogConfig),
  },
});
const verify = ref();
const { modelValue, config } = toRefs(props);
const emit = defineEmits(['update:modelValue']);
const { userInfo } = useCommonData();

// 发送验证码
const sendCodeFuc = (data: QueryCodeParams) => {
  return new Promise((resolve, rejects) => {
    sendCode(data)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        rejects(err);
      });
  });
};

// 限制验证码重发
const oldaccount_num = ref(false);
const account_num = ref(false);

// 获取验证码
const verifySuccessType = ref('');
const getcode = (formEl: FormInstance | undefined, type?: string) => {
  if (!formEl) return;
  verifySuccessType.value = type || 'account';
  formEl.validateField(verifySuccessType.value, (valid) => {
    if (valid) {
      verify.value.show();
    } else {
      return false;
    }
  });
};

const verifySuccess = (data: any) => {
  const param: QueryCodeParams = {
    account_type: config.value.account_type,
    account: form[verifySuccessType.value],
    captchaVerification: data.captchaVerification,
  };
  if (config.value.field) {
    Object.assign(param, { field: config.value.field });
  }
  (config.value?.code?.getCode || sendCodeFuc)(param).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.SEND_SUCCESS,
    });
    if (verifySuccessType.value === 'oldaccount') {
      oldaccount_num.value = true;
    } else {
      account_num.value = true;
    }
  });
};

// 表单值
const form = reactive({
  oldaccount: '',
  oldcode: '',
  account: '',
  code: '',
} as any);
// 清空表单
const clear = () => {
  form.oldaccount = '';
  form.oldcode = '';
  form.account = '';
  form.code = '';
  oldaccount_num.value = false;
  account_num.value = false;
};
const close = () => {
  clear();
  emit('update:modelValue', false);
};
const open = () => {
  clear();
  form.oldaccount =
    config.value.account_type === 'email'
      ? userInfo.value.email
      : userInfo.value.phone;
};
const confirm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      config.value?.confirm({
        account_type: config.value.account_type,
        ...form,
      });
    } else {
      return false;
    }
  });
};
const defaultRules = [
  {
    required: true,
    message: useI18nStr('NOT_EMPTY'),
    trigger: 'blur',
  },
];
// 旧账户不能与新账户一致
const validatorSameAccount = (rule: any, value: any, callback: any) => {
  if (value) {
    if (form.oldaccount && form.oldaccount === value) {
      const msg =
        config.value.account_type === 'email'
          ? i18n.value.SAME_EMAIL
          : i18n.value.SAME_PHONE;
      callback(msg);
    } else {
      callback();
    }
  }
};
const rules = ref(defaultRules);
const sameAccount = [
  {
    validator: validatorSameAccount,
    trigger: 'blur',
  },
];
const emailRules = ref([
  ...defaultRules,
  {
    pattern: EMAIL_REG,
    message: useI18nStr('ENTER_VAILD_EMAIL'),
    trigger: 'blur',
  },
  ...sameAccount,
]);
const phoneRules = ref([...defaultRules, ...sameAccount]);
const accountPlaceholder = computed(
  () =>
    i18n.value[config.value?.account?.placeholder] || i18n.value.ENTER_NEW_EMAIL
);
const codePlaceholder = computed(
  () =>
    i18n.value[config.value?.code?.placeholder] || i18n.value.ENTER_EMAIL_CODE
);
</script>
<template>
  <el-dialog
    v-model="modelValue"
    :draggable="true"
    width="100%"
    :before-close="close"
    :show-close="false"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @open="open"
  >
    <template #header>
      <h5 class="header">{{ i18n[config.header] }}</h5>
    </template>
    <div class="main">
      <div v-if="config.content">{{ i18n[config.content] }}</div>
      <el-form
        ref="formRef"
        label-width="auto"
        :model="form"
        style="max-width: 460px"
        label-position="top"
      >
        <el-form-item
          v-if="config?.oldaccount"
          :label="i18n[config?.oldaccount?.label]"
          prop="oldaccount"
        >
          <OInput v-model.trim="form.oldaccount" disabled />
        </el-form-item>
        <el-form-item
          v-if="config?.oldcode"
          :label="i18n[config?.oldcode?.label]"
          prop="oldcode"
          :rules="rules"
        >
          <div class="code">
            <OInput v-model.trim="form.oldcode" :placeholder="codePlaceholder" />
            <CountdownButton
              v-model="oldaccount_num"
              class="btn"
              size="small"
              @click="getcode(formRef, 'oldaccount')"
            />
          </div>
        </el-form-item>
        <el-form-item
          v-if="config?.account"
          :label="i18n[config?.account?.label]"
          prop="account"
          :rules="config.account_type === 'email' ? emailRules : phoneRules"
        >
          <OInput v-model.trim="form.account" :placeholder="accountPlaceholder" />
        </el-form-item>
        <el-form-item
          v-if="config?.code"
          :label="i18n[config?.code?.label]"
          prop="code"
          :rules="rules"
        >
          <div class="code">
            <OInput v-model.trim="form.code" :placeholder="codePlaceholder" />
            <CountdownButton
              v-model="account_num"
              class="btn"
              size="small"
              @click="getcode(formRef)"
            />
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="footer">
        <OButton class="close-btn btn" size="small" @click="close">{{
          i18n.CANCEL
        }}</OButton>
        <OButton
          class="btn"
          size="small"
          type="primary"
          @click="confirm(formRef)"
          >{{ i18n.CONFIRM }}</OButton
        >
      </div>
    </template>
    <Verify
      ref="verify"
      mode="pop"
      captcha-type="blockPuzzle"
      :img-size="{ width: '400px', height: '200px' }"
      @success="verifySuccess"
    ></Verify>
  </el-dialog>
</template>
<style lang="scss" scoped>
.header {
  font-size: var(--o-font-size-h5);
  line-height: var(--o-line-height-h5);
  font-weight: 600;
  text-align: center;
}
.footer {
  display: flex;
  justify-content: center;
  .close-btn {
    margin-right: var(--o-spacing-h4);
  }
}
.main {
  max-width: 460px;
  margin: 0 auto;
  .code {
    display: grid;
    grid-template-columns: auto max-content;
    width: 100%;
    grid-gap: var(--o-spacing-h4);
  }
}
.btn {
  height: 38px;
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
</style>
