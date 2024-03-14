<script setup lang="ts">
import { useI18n } from '../i18n';
import { formValidator, getFitWidth } from '../utils/utils';
import { reactive, ref, toRefs } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { modifyUser } from '../api/api-center';
import { useCommonData } from '../stores/common';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'submit']);
const i18n = useI18n();

const deleteAgree = () => {
  const param = {
    oneidPrivacyAccepted: 'revoked',
  };
  modifyUser(param).then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.DELETE_SUCCESS,
    });
    close();
    emit('submit');
  });
};

const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl).subscribe((valid) => {
    if (valid) {
      deleteAgree();
    } else {
      return false;
    }
  });
};
// 表单值
const formRef = ref<FormInstance>();
const form = reactive({
  text: '',
} as any);
const validatorText = (rule: any, value: any, callback: any) => {
  if (value === 'delete') {
    callback();
  } else {
    callback(i18n.value.DELETE_ENTER_ERR);
  }
};
const rules = ref([
  {
    validator: validatorText,
    trigger: 'blur',
  },
]);

const close = () => {
  emit('update:modelValue', false);
  formRef.value?.resetFields();
};
// 隐私政策、法律声明
const { lang } = useCommonData();
const goToOtherPage = (type: string) => {
  const origin = import.meta.env.VITE_OPENEULER_WEBSITE;
  const url = `${origin}/${lang.value}/other/${type}`;
  window.open(url, '_blank');
};
</script>
<template>
  <el-dialog
    v-model="modelValue"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="getFitWidth(540)"
    :before-close="close"
    :show-close="false"
    :destroy-on-close="true"
  >
    <template #header>
      <h5 class="header">{{ i18n.CANCEL_SIGN }}</h5>
    </template>
    <div class="main-content">
      <div>
        {{ i18n.CANCEL_SIGN_OF }}
        <a @click="goToOtherPage('privacy')">{{ i18n.PRIVACY_POLICY }}</a>
        {{ i18n.AND }}
        <a @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</a>
        {{ i18n.CANCEL_SIGN_OF_LOGOUT }}
      </div>
      <div class="delete-tips">{{ i18n.DELETE_ENTER }}</div>
      <el-form
        ref="formRef"
        label-width="auto"
        :model="form"
        style="max-width: 460px"
      >
        <el-form-item prop="text" :rules="rules">
          <OInput v-model="form.text" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="ofooter">
        <OButton class="close-btn footer-btn" size="small" @click="close">{{
          i18n.CANCEL
        }}</OButton>
        <OButton
          class="footer-btn"
          size="small"
          type="primary"
          @click="submit(formRef)"
          >{{ i18n.CONFIRM }}</OButton
        >
      </div>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
.header {
  font-size: var(--o-font-size-h5);
  line-height: var(--o-line-height-h5);
  font-weight: 600;
  text-align: center;
}
.ofooter {
  display: flex;
  justify-content: center;
  .close-btn {
    margin-right: var(--o-spacing-h4);
  }
}
.main-content {
  max-width: 460px;
  margin: 0 auto;
  .delete-tips {
    margin: 16px 0;
  }
}
.footer-btn {
  height: 38px;
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
</style>
