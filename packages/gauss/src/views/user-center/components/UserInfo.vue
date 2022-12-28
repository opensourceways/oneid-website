<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import { useCommon, useCommonData } from 'shared/stores/common';
import { modifyUser } from 'shared/api/api-center';
import { ElMessage, FormInstance } from 'element-plus';
import { getCommunityParams } from '@/shared/utils';
import { Observable } from 'rxjs';
import { IObject } from 'shared/@types/interface';
import {
  getCompanyRules,
  getNicknammeRules,
  formValidator,
} from 'shared/utils/utils';
const formRef1 = ref<FormInstance>();
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
    key: 'username',
    label: useI18nStr('USER_NAME'),
    disabled: true,
  },
  {
    key: 'email',
    label: useI18nStr('EMAIL'),
    placeholder: '-',
    disabled: true,
  },
  {
    key: 'phone',
    label: useI18nStr('PHONE'),
    placeholder: '-',
    disabled: true,
  },
  {
    key: 'signedUp',
    label: useI18nStr('SIGNED_UP'),
    disabled: true,
  },
  {
    key: 'nickname',
    label: useI18nStr('NICKNAME'),
    placeholder: useI18nStr('ENTER_NICKNAME'),
    disabled: false,
    rules: getNicknammeRules(),
  },
  {
    key: 'company',
    label: useI18nStr('COMPANY'),
    placeholder: useI18nStr('ENTER_COMPANY'),
    disabled: false,
    rules: getCompanyRules(),
  },
]);
// 表单值
const form = reactive({
  username: '',
  email: '',
  phone: '',
  signedUp: '',
  nickname: '',
  company: '',
} as any);
const initData = () => {
  data.value.forEach((item: IObject) => {
    if (item.key in userInfo.value) {
      if (item.key === 'signedUp') {
        form[item.key] = getTimeData(userInfo.value[item.key]);
      } else {
        form[item.key] = userInfo.value[item.key] || '';
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

const submit = (formEl: FormInstance | undefined) => {
  getSubmitParams(formEl).subscribe((body: any) => {
    if (Object.keys(body).length) {
      modifyUser(body, getCommunityParams(true)).then(() => {
        ElMessage.success({
          showClose: true,
          message: i18n.value.MODIFY_SUCCESS,
        });
        store.initUserInfo(getCommunityParams(true));
      });
    }
  });
};
// 获取下发参数
const getSubmitParams = (formEl: FormInstance | undefined) => {
  return new Observable((observer) => {
    if (!formEl) {
      observer.next({});
      observer.complete();
      return;
    }
    formValidator(formEl).subscribe((valid) => {
      if (valid) {
        const param: IObject = data.value.reduce((pre, next) => {
          if (
            !next.disabled &&
            next.key in userInfo.value &&
            form[next.key] !== userInfo.value[next.key]
          ) {
            pre[next.key] = form[next.key];
          }
          return pre;
        }, {} as IObject);
        observer.next(param);
        observer.complete();
      } else {
        observer.next({});
        observer.complete();
      }
    });
  });
};
</script>
<template>
  <ContentBox>
    <template #header>
      {{ i18n.INFO }}
    </template>
    <template #content>
      <el-form ref="formRef1" label-width="0" :model="form" class="info-item">
        <span v-for="item in data" :key="item.key" class="info-item">
          <p class="info-label">{{ item.label }}</p>
          <el-form-item
            :prop="item.key"
            class="info-form-pd"
            :rules="item.rules"
          >
            <OInput
              v-model="form[item.key]"
              class="info-input"
              :disabled="item.disabled"
              :placeholder="item.placeholder"
            />
          </el-form-item>
        </span>
      </el-form>
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
}
.btn {
  margin-top: var(--o-spacing-h4);
}
</style>
