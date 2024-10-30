<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import { useCommon, useCommonData } from 'shared/stores/common';
import { modifyUser } from 'shared/api/api-center';
import { ElMessage, FormInstance } from 'element-plus';
import { getUsernammeRules, maskUserInfo, getCompanyRules, getNicknammeRules, formValidator } from 'shared/utils/utils';
import MaskEye from 'shared/components/MaskEye.vue';
import { Observable } from 'rxjs';
import { IObject } from 'shared/@types/interface';
const formRef1 = ref<FormInstance>();
const { userInfo } = useCommonData();
const store = useCommon();

const i18n = useI18n();

const data = ref([
  {
    key: 'username',
    label: useI18nStr('USER_NAME'),
    disabled: true,
    rules: getUsernammeRules(),
  },
  {
    key: 'email',
    label: useI18nStr('EMAIL'),
    placeholder: '-',
    disabled: true,
    isMask: true,
  },
  {
    key: 'phoneCountry',
    label: useI18nStr('PHONE'),
    placeholder: '-',
    disabled: true,
    isMask: true,
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

// 获取下发参数
const getSubmitParams = (formEl: FormInstance | undefined) => {
  return new Observable((observer) => {
    if (!formEl) {
      observer.next({});
      observer.complete();
      return;
    }
    const param: IObject = data.value.reduce((pre, next) => {
      if (
        !next.disabled &&
        (next.key || userInfo.value[next.key]) &&
        form[next.key] !== userInfo.value[next.key]
      ) {
        pre[next.key] = form[next.key];
      }
      return pre;
    }, {} as IObject);
    const keys = Object.keys(param);
    if (keys.length) {
      formValidator(formEl, keys).subscribe((valid) => {
        if (valid) {
          observer.next(param);
          observer.complete();
        } else {
          observer.next({});
          observer.complete();
        }
      });
    } else {
      observer.next({});
      observer.complete();
    }
  });
};

const submit = (formEl: FormInstance | undefined) => {
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
</script>
<template>
  <ContentBox>
    <template #header>
      {{ i18n.INFO }}
    </template>
    <template #content>
      <el-form
        ref="formRef1"
        label-width="0"
        :model="form"
      >
        <el-form-item
          v-for="item in data" :key="item.key"
          :prop="item.key"
          :rules="item.rules"
          class="info-form-pd"
        >
          <div class="info-item">
            <p class="info-label">{{ item.label }}</p>
            <template v-if="userInfo[item.key] && Object.prototype.hasOwnProperty.call(item, 'isMask')">
              <OInput
                :value="maskUserInfo(userInfo[item.key], item.isMask)"
                class="info-input"
                :disabled="item.disabled"
                :placeholder="item.placeholder"
              />
              <OIcon class="icon-eye">
                <MaskEye v-model="item.isMask"></MaskEye>
              </OIcon>
            </template>
            <OInput
              v-else
              v-model="form[item.key]"
              class="info-input"
              :disabled="item.disabled"
              :placeholder="item.placeholder"
            />
          </div>
        </el-form-item>
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
.info-form-pd {
  padding-bottom: var(--o-spacing-h9);
}
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
}
.icon-eye {
  font-size: 24px;
  margin-left: 16px;
  position: relative;
  .eyes {
    position: absolute;
    top: 5px;
  }
}
.btn {
  margin-top: var(--o-spacing-h4);
}
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--o-color-error1) inset;
}
</style>
