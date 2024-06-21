<script setup lang="ts">
import { useI18n } from 'shared/i18n';
import {reactive, ref, toRefs, watch } from 'vue';
import { OScroller, OCheckbox, ODialog, OLink, OForm, OFormItem, OButton } from '@opensig/opendesign';
import { RulesT, ValidatorT } from '@opensig/opendesign/lib/form/types';
import {
  formValidator,
} from 'shared/utils/rules';
import { useMarkdown } from 'shared/utils/useMarkdown';
import { modifyUser } from 'shared/api/api-center';
import { getPrivacyDocs } from 'shared/api/api-docs';
import { useCommonData } from 'shared/stores/common';

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
const formRef = ref<InstanceType<typeof OForm>>();
const scroller = ref();

// 表单值
const form = reactive({
  policy: [],
} as any);

// checkbox校验
const validatorCheckbox: ValidatorT = (value: Array<string>) => {
  if (!value || !value.length) {
    return {
      type: 'danger',
      message: useI18n().value.PLEASE_CHECK_PRIVACY,
    };
  }
};
// 隐私声明校验
const policyRules = reactive<RulesT[]>([
  {
    validator: validatorCheckbox,
    triggers: 'change',
  },
]);
const privacyData = ref('');
const legalData = ref('');

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const arr = lang.value === 'zh' ? ['privacy.md', 'legal.md'] : ['privacy_en.md', 'legal_en.md'];
      Promise.all(arr.map((item) => getPrivacyDocs(item))).then((res) => {
        privacyData.value = useMarkdown().mkit(res[0]);
        legalData.value = useMarkdown().mkit(res[1]);
      });
    }
  },
  { immediate: true }
)

const close = () => {
  emit('update:modelValue', false);
  formRef.value?.resetFields();
};

const doSuccess = () => {
  emit('success');
  close();
};

const changeCheckBox = () => {
  if (form.policy.length) {
    form.policy = [];
  } else {
    form.policy.push('1');
  }
  formRef.value?.validate('policy');
};

const putUser = () => {
  formValidator(formRef.value, 'policy').subscribe((valid) => {
    if (valid) {
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

const scroll = (id: string) => {
  scroller.value.scrollTo({ top: document.getElementById(id)?.offsetTop || 0, behavior: 'smooth' });
} 
</script>
<template>
  <ODialog v-model:visible="modelValue" hideClose :maskClose="false" size="large">
    <OScroller ref="scroller" style="height: 100%" wrapClass="markdown-body" showType="always">
      <div id="privacy" v-dompurify-html="privacyData"></div>
      <div id="legal" v-dompurify-html="legalData"></div>
    </OScroller>
    <template #footer>
      <OForm
        ref="formRef"
        label-width="0"
        :model="form"
        class="form"
        @submit.prevent=""
      >
        <OFormItem field="policy" :rules="policyRules">
          <div class="checkbox">
            <OCheckbox
              value="1"
              v-model="form.policy"
              @change="formRef?.validate('policy')"
            >
            </OCheckbox>
            <span>
              <span class="cursor" @click="changeCheckBox()">
                {{ i18n.READ_ADN_AGREE }}
              </span>
              <span>&nbsp;</span>
              <OLink hover-underline @click="scroll('privacy')">{{ i18n.PRIVACY_POLICY }}</OLink>
              {{ i18n.AND }}
              <OLink hover-underline @click="scroll('legal')">{{ i18n.LEGAL_NOTICE }}</OLink>
            </span>
          </div>
        </OFormItem>
      </OForm>
      <div class="o-dlg-actions">
        <OButton size="large" @click="putUser()" class="o-dlg-btn">{{ i18n.CONFIRM }}</OButton>
        <OButton size="large" @click="cancelPad()" class="o-dlg-btn">{{ i18n.CANCEL }}</OButton>
      </div>
    </template>
  </ODialog>
</template>
<style lang="scss" scoped>
.form {
  margin-top: 32px;
  --form-label-main-gap: 0;
  .o-form-item:last-child {
    margin-bottom: var(--form-item-gap);
  }
  .o-form-item-danger {
    margin-bottom: 0 !important;
  }
}
.cursor {
  cursor: pointer;
}
.checkbox {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  color: var(--o-color-info1);
  @include tip1;
}
</style>
