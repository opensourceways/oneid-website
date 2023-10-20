<script setup lang="ts">
import { useI18n } from '../i18n';
import { formValidator, getFitWidth, getPwdRules } from '../utils/utils';
import { reactive, ref, toRefs } from 'vue';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { updatePassword } from '../api/api-center';
import { getRsaEncryptWord } from '../utils/rsa';
import { useCommonData } from '../stores/common';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const { loginParams } = useCommonData();
const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'submit']);
const i18n = useI18n();

const formRef = ref<FormInstance>();
// 表单值
const form = reactive({
  old_pwd: '',
  new_pwd: '',
} as any);

const close = () => {
  emit('update:modelValue', false);
  formRef.value?.resetFields();
};
const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl).subscribe(async (valid) => {
    if (valid) {
      const pwd = await getRsaEncryptWord([form.old_pwd, form.new_pwd]);
      const param = {
        community: import.meta.env?.VITE_COMMUNITY,
        client_id: loginParams.value.client_id,
        old_pwd: pwd[0],
        new_pwd: pwd[1],
      };
      updatePassword(param).then(() => {
        ElMessage.success({
          showClose: true,
          message: i18n.value.MODIFY_SUCCESS,
        });
        emit('submit', form);
        close();
      });
    } else {
      return false;
    }
  });
};

// 空值校验
const requiredRules: FormItemRule[] = [
  {
    required: true,
    message: i18n.value.NOT_EMPTY,
    trigger: 'blur',
  },
];
const pwdrule = ref([...requiredRules, ...getPwdRules()]);
const rules = ref(requiredRules);
</script>
<template>
  <el-dialog
    v-model="modelValue"
    :before-close="close"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :width="getFitWidth(420)"
    align-center
  >
    <template #header>
      <h5 class="header">{{ i18n.FORGET_PWD }}</h5>
    </template>
    <el-form
      ref="formRef"
      label-width="0"
      :model="form"
      class="form"
      @submit.prevent=""
    >
      <el-form-item prop="old_pwd" :rules="rules">
        <OInput
          v-model="form.old_pwd"
          :placeholder="i18n.INTER_OLD_PWD"
          type="password"
          show-password
        />
      </el-form-item>
      <el-form-item prop="new_pwd" :rules="pwdrule">
        <OInput
          v-model="form.new_pwd"
          :placeholder="i18n.INTER_NEW_PWD"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="footer">
        <OButton size="small" @click="close">{{ i18n.CANCEL }}</OButton>
        <OButton size="small" type="primary" @click="submit(formRef)">{{
          i18n.CONFIRM
        }}</OButton>
      </div>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
.header {
  font-size: var(--o-font-size-h5);
  line-height: var(--o-line-height-h5);
  font-weight: normal;
  text-align: center;
  margin-left: var(--o-spacing-h5);
  padding-top: 28px;
}
.form {
  padding: 0 28px;
}
.footer {
  display: flex;
  justify-content: center;
  column-gap: var(--o-spacing-h5);
  padding-bottom: 28px;
}
.el-form-item {
  margin-bottom: 24px;
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
</style>
