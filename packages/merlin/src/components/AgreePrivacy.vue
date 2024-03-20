<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import { onMounted, reactive, ref, toRefs } from 'vue';
import { FormInstance, FormItemRule } from 'element-plus';
import { formValidator, doValidatorForm } from 'shared/utils/utils';
import { OScroller, OCheckbox, ODialog, DialogActionT } from '@opensig/opendesign';
import { useMarkdown } from 'shared/utils/useMarkdown';
import { modifyUser } from 'shared/api/api-center';
import merlinlegal from '@/assets/markdown/legal.md?raw'
import merlinprivacy from '@/assets/markdown/privacy.md?raw'

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
const privacyData = ref('');
const legalData = ref('');

onMounted(() => {
  privacyData.value = useMarkdown().mkit(merlinprivacy);
  legalData.value = useMarkdown().mkit(merlinlegal);
})

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
const dlgAction: DialogActionT[] = [
  {
    id: 'cancel',
    label: i18n.value.CANCEL,
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
  <ODialog :scroller="false"  v-model:visible="modelValue" :actions="dlgAction" size="large">
    <OScroller style="height: 400px" wrapClass="markdown-body" showType="always">
      <div v-dompurify-html="privacyData"></div>
      <div v-dompurify-html="legalData"></div>
    </OScroller>
    <el-form
      ref="formRef"
      label-width="0"
      :model="form"
      class="form"
      @submit.prevent=""
    >
      <el-form-item prop="policy" :rules="policyRules">
        <div class="checkbox">
          <OCheckbox
            value="1"
            v-model="form.policy"
            @change="doValidatorForm(formRef, 'policy')"
          >
          </OCheckbox>
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
  </ODialog>
</template>
<style lang="scss" scoped>
.form {
  margin-top: 32px;
  .el-form-item {
    margin-bottom: 0;
  }
}
.cursor {
  cursor: pointer;
}
.checkbox {
  display: grid;
  grid-template-columns: auto auto;
  align-items: start;
  color: var(--o-color-info1);
  @include tip1;
}
</style>
