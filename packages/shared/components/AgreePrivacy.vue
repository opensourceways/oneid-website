<script setup lang="ts">
import { useI18n } from '../i18n';
import { reactive, ref, toRefs, watch } from 'vue';
import { FormInstance, FormItemRule } from 'element-plus';
import { formValidator, getFitWidth, doValidatorForm } from '../utils/utils';
import { useMarkdown } from '../utils/useMarkdown';
import { modifyUser } from '../api/api-center';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'cancel', 'success']);
const i18n = useI18n();
const formRef = ref<FormInstance>();

// 表单值
const form = reactive({
  policy: [],
} as any);

// checkbox校验
const validatorCheckbox = (rule: any, value: any, callback: any) => {
  if (!value || !value.length) {
    callback(i18n.value.PLEASE_CHECK_PRIVACY);
  } else {
    callback();
  }
};
// 隐私声明校验
const policyRules = reactive<FormItemRule[]>([
  {
    validator: validatorCheckbox,
    trigger: 'change',
  },
]);

/**
 * 根据文件url获取文件内容
 */
const getContentFromFileUrl = (
  url: string,
  callback: (val: string) => void
) => {
  const xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.responseType = 'blob';
  xhr.onload = () => {
    if (xhr.status === 200) {
      const reader = new FileReader();
      reader.readAsText(xhr.response);
      reader.onload = () => {
        const result: string = (reader.result as string) || '';
        const index = result.indexOf('<div');
        callback && callback(result.slice(index));
      };
    }
  };
  xhr.send();
};
const privacyData = ref('');
const legalData = ref('');
watch(
  () => modelValue.value,
  (value) => {
    if (value) {
      getContentFromFileUrl(
        '/openeuler/openEuler-portal/raw/master/app/zh/other/privacy/index.md',
        (val) => {
          privacyData.value = useMarkdown().mkit(val);
        }
      );
      getContentFromFileUrl(
        '/openeuler/openEuler-portal/raw/master/app/zh/other/legal/index.md',
        (val) => {
          legalData.value = useMarkdown().mkit(val);
        }
      );
    }
  },
  {
    immediate: true,
  }
);

const close = () => {
  emit('update:modelValue', false);
  formRef.value?.resetFields();
};

const doSuccess = () => {
  emit('success');
  close();
};

const changeCheckBox = (formEl: FormInstance | undefined) => {
  if (form.policy.length) {
    form.policy = [];
  } else {
    form.policy.push('1');
  }
  doValidatorForm(formEl, 'policy');
};

const putUser = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl).subscribe((data) => {
    if (data) {
      modifyUser({
        oneidPrivacyAccepted: import.meta.env?.VITE_ONEID_PRIVACYACCEPTED,
      }).then(() => {
        doSuccess();
      });
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
    :width="getFitWidth(880)"
    align-center
  >
    <el-scrollbar height="400px">
      <div v-dompurify-html="privacyData"></div>
      <div v-dompurify-html="legalData"></div>
    </el-scrollbar>
    <el-form
      ref="formRef"
      label-width="0"
      :model="form"
      class="form"
      @submit.prevent=""
    >
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
            <span>{{ i18n.PRIVACY_POLICY }}</span>
            {{ i18n.AND }}
            <span>{{ i18n.LEGAL_NOTICE }}</span>
          </span>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="footer">
        <OButton size="small" @click="cancelPad">{{ i18n.CANCEL }}</OButton>
        <OButton size="small" type="primary" @click="putUser(formRef)">{{
          i18n.CONFIRM
        }}</OButton>
      </div>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
.form {
  margin-top: 32px;
  .el-form-item {
    margin-bottom: 0;
  }
}
.footer {
  display: flex;
  justify-content: center;
  column-gap: var(--o-spacing-h5);
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
</style>
