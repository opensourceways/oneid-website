<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import { useCommon, useCommonData } from 'shared/stores/common';
import { modifyUser } from 'shared/api/api-center';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { getUsernammeRules } from 'shared/utils/utils';
import { Observable } from 'rxjs';
import { IObject } from 'shared/@types/interface';
const formRef1 = ref<FormInstance[]>();
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({} as IObject),
  },
});
const { userInfo } = useCommonData();
const store = useCommon();

const i18n = useI18n();

const data = ref([
  {
    key: 'userName',
    label: useI18nStr('USER_NAME'),
    value: '',
    disabled: true,
  },
  {
    key: 'email',
    label: useI18nStr('EMAIL'),
    value: '',
    placeholder: '-',
    disabled: true,
  },
  {
    key: 'phone',
    label: useI18nStr('PHONE'),
    value: '',
    placeholder: '-',
    disabled: true,
  },
  {
    key: 'signedUp',
    label: useI18nStr('SIGNED_UP'),
    value: '',
    disabled: true,
  },
  {
    key: 'nickName',
    label: useI18nStr('NICKNAME'),
    value: '',
    placeholder: useI18nStr('ENTER_NICKNAME'),
    disabled: false,
  },
  {
    key: 'company',
    label: useI18nStr('COMPANY'),
    value: '',
    placeholder: useI18nStr('ENTER_COMPANY'),
    disabled: false,
  },
]);

const initData = () => {
  data.value.forEach((item: IObject) => {
    if (item.key in userInfo.value) {
      if (item.key === 'signedUp') {
        item.value = getTimeData(userInfo.value[item.key]);
      } else {
        item.value = userInfo.value[item.key] || '';
      }
    }
  });
};

watch(
  () => userInfo.value,
  () => {
    initData();
  },
  { deep: true }
);
onMounted(() => {
  initData();
});

// 显示注册时间
const getTimeData = (time: string): string => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
    2,
    '0'
  )}`;
};

const submit = (formEl: FormInstance[] | undefined) => {
  getSubmitParams(formEl).subscribe((param: any) => {
    if (Object.keys(param).length) {
      modifyUser(param).then(() => {
        ElMessage.success({
          showClose: true,
          message: i18n.value.MODIFY_SUCCESS,
        });
        store.initUserInfo();
      });
    }
  });
};
// 获取下发参数
const getSubmitParams = (formEl: FormInstance[] | undefined) => {
  return new Observable((observer) => {
    if (!formEl) {
      observer.next({});
      observer.complete();
      return;
    }
    const param: IObject = data.value.reduce((pre, next) => {
      if (
        !next.disabled &&
        next.key in userInfo.value &&
        next.value !== userInfo.value[next.key]
      ) {
        pre[next.key] = next.value;
      }
      return pre;
    }, {} as IObject);
    if (!userInfo.value.userName) {
      formEl[0].validate((valid: boolean) => {
        if (valid) {
          Object.assign(param, { username: form.userName });
          observer.next(param);
          observer.complete();
        } else {
          observer.next({});
          observer.complete();
        }
      });
    } else {
      observer.next(param);
      observer.complete();
    }
  });
};

// 表单值
const form = reactive({
  userName: '',
} as any);
// 用户名校验
const userNameRules = reactive<FormItemRule[]>(getUsernammeRules());
</script>
<template>
  <ContentBox>
    <template #header>
      {{ i18n.INFO }}
    </template>
    <template #content>
      <div v-for="item in data" :key="item.key" class="info-item">
        <p class="info-label">{{ item.label }}</p>
        <el-form
          v-if="item.key === 'userName' && !item.value"
          ref="formRef1"
          label-width="0"
          :model="form"
        >
          <el-form-item
            prop="userName"
            :rules="userNameRules"
            class="info-form-pd"
          >
            <OInput
              v-model="form.userName"
              class="info-input"
              :placeholder="i18n.ENTER_USERNAME"
            />
          </el-form-item>
        </el-form>
        <OInput
          v-else
          v-model="item.value"
          class="info-input info-pd"
          :disabled="item.disabled"
          :placeholder="item.placeholder"
        />
      </div>
      <OButton
        class="btn"
        size="small"
        type="primary"
        @click="submit(formRef1)"
        >{{ i18n.SAVE }}</OButton
      >
    </template>
  </ContentBox>
</template>
<style lang="scss" scoped>
.info-item {
  .info-label {
    font-size: var(--o-font-size-h7);
    line-height: var(--o-line-height-h7);
    font-weight: 400;
    margin-bottom: var(--o-spacing-h5);
  }
  .info-input {
    width: 400px;
  }
  .info-form-pd {
    padding-bottom: var(--o-spacing-h9);
  }
  .info-pd {
    padding-bottom: var(--o-spacing-h4);
  }
}
.btn {
  margin-top: var(--o-spacing-h4);
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
</style>
