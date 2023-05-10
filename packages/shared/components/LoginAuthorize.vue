<script lang="ts" setup>
import { FormInstance, FormItemRule } from 'element-plus';
import { doValidatorForm, formValidator } from '../utils/utils';
import { reactive, ref } from 'vue';

const formRef = ref<FormInstance>();
// 表单值
const form = reactive({
  policy: [],
} as any);
// checkbox校验
const validatorCheckbox = (rule: any, value: any, callback: any) => {
  if (!value || !value.length) {
    callback('请勾选确认授权信息');
  } else {
    callback();
  }
};
const policyRules = reactive<FormItemRule[]>([
  {
    validator: validatorCheckbox,
    trigger: 'change',
  },
]);

const changeCheckBox = (formEl: FormInstance | undefined) => {
  if (form.policy.length) {
    form.policy = [];
  } else {
    form.policy.push('1');
  }
  doValidatorForm(formEl);
};

const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formValidator(formEl).subscribe((valid) => {
    if (valid) {
    } else {
      return false;
    }
  });
};
</script>

<template>
  <header>授权</header>
  <p class="nav">授权访问你的公共数据，包括:</p>
  <el-form ref="formRef" label-width="0" :model="form">
    <el-form-item prop="policy" :rules="policyRules">
      <div class="checkbox">
        <OCheckboxGroup
          v-model="form.policy"
          @change="doValidatorForm(formRef, 'policy')"
        >
          <OCheckbox value="1"></OCheckbox>
        </OCheckboxGroup>
        <span class="cursor" @click="changeCheckBox(formRef)">
          获取您的基本信息(头像、昵称、手机号及邮箱号)
        </span>
      </div>
    </el-form-item>
  </el-form>
  <footer>
    <OButton class="btn"> 拒绝 </OButton>
    <OButton type="primary" class="btn" @click="submit(formRef)">
      授权
    </OButton>
    <OButton class="btn"> 切换登录 </OButton>
  </footer>
</template>

<style lang="scss" scoped>
header {
  text-align: center;
  font-size: var(--o-font-size-h5);
  line-height: var(--o-line-height-h5);
  color: var(--o-color-text1);
}
.nav {
  line-height: var(--o-line-height-h4);
  margin-top: var(--o-spacing-h5);
}
.checkbox {
  display: grid;
  grid-template-columns: auto auto;
  align-items: start;
  color: var(--o-color-text1);
  font-size: var(--o-font-size-text);
  line-height: var(--o-line-height-text);
  .cursor {
    cursor: pointer;
  }
  .o-checkbox-group {
    padding-top: 3px;
  }
}
footer {
  display: grid;
  row-gap: var(--o-spacing-h7);
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
