<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import { reactive, ref, toRefs, watch } from 'vue';
import { FormInstance, FormItemRule } from 'element-plus';
import {
  formValidator,
  getFitWidth,
  doValidatorForm,
} from 'shared/utils/utils';
import { useMarkdown } from 'shared/utils/useMarkdown';
import { modifyUser } from 'shared/api/api-center';
import { useCommonData } from 'shared/stores/common';
import privacy from '../shared/privacy-policy.md?raw';
import privacy_en from '../shared/privacy-policy_en.md?raw';
import legal from '../shared/legal_statement.md?raw';
import legal_en from '../shared/legal_statement_en.md?raw';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const { lang } = useCommonData();
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

const privacyData = ref('');
const legalData = ref('');
watch(
  () => modelValue.value,
  (value) => {
    if (value) {
      let val;
      let item;
      if (lang.value === 'zh') {
        val = privacy;
        item = legal;
      } else {
        val = privacy_en;
        item = legal_en;
      }
      privacyData.value = useMarkdown().mkit(val);
      legalData.value = useMarkdown().mkit(item);
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
      <div class="markdown-content" v-dompurify-html="privacyData"></div>
      <div class="markdown-content" v-dompurify-html="legalData"></div>
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
        <OButton size="small" @click="putUser(formRef)">{{
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
.markdown-content + .markdown-content {
  margin-top: 40px;
}
</style>
