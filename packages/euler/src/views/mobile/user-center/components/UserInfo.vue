<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import { useCommon, useCommonData } from 'shared/stores/common';
import { modifyUser } from 'shared/api/api-center';
import { ElMessage, FormInstance } from 'element-plus';
import { Observable } from 'rxjs';
import { IObject } from 'shared/@types/interface';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useRouter } from 'vue-router';
import { getUsernammeRules, maskUserInfo, getCompanyRules, getNicknammeRules, formValidator } from 'shared/utils/utils';
import MaskEye from 'shared/components/MaskEye.vue';
const router = useRouter();
const formRef1 = ref<FormInstance>();
// const props = defineProps({
//   userInfo: {
//     type: Object,
//     default: () => ({} as IObject),
//   },
// });
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

const goToTree = () => {
  router.push(`/${store.lang}/mobile/profile`);
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
  store.initUserInfo();
  initData();
});
</script>
<template>
  <AppHeader />
  <main>
    <div class="banner">
      <div class="center-title">
        <h1 class="center-title-in">USER CENTER</h1>
        <h1 class="center-title-out">{{ i18n.USER_CENTER }}</h1>
      </div>
    </div>
    <div class="title">
      <span class="left" @click="goToTree"> </span
      ><span style="font-size: 16px">{{ i18n.INFO }}</span>
    </div>
    <ContentBox>
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
            :inline-message="true"
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
  </main>

  <AppFooter />
</template>
<style lang="scss" scoped>
.info-item {
  display: flex;
  background-color: var(--o-color-bg2);
  width: 100%;
  align-items: center;
  .info-label {
    font-size: 14px;
    line-height: 22px;
    font-weight: 400;
    min-width: 80px;
    height: 54px;
    margin-left: 16px;
    display: flex;
    align-items: center;
  }
}
.icon-eye {
  font-size: 16px;
  margin-right: 4px;
}
.btn {
  margin-top: var(--o-spacing-h4);
  position: relative;
  left: 40%;
}
:deep(.el-form-item.is-error .is-focus .el-input) {
  box-shadow: none !important;
}
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 0px var(--o-color-bg2, var(--o-color-bg2)) inset !important;
  background-color: var(--o-color-bg2);
}
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: var(--o-color-bg2);
}
.banner {
  width: 100%;
  height: 126px;
  background-image: url('@/assets/banner_mobile.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: left;
  background-color: var(--o-color-bg2);
  .center-title {
    padding: 0 var(--o-spacing-h6);
    position: relative;
    &-in {
      position: absolute;
      top: 38px;
      font-size: 24px;
      font-weight: bold;
      color: rgba(0, 47, 167, 0.14);
      line-height: 34px;
    }
    &-out {
      position: absolute;
      top: 28px;
      font-size: 18px;
      font-weight: 500;
      color: var(--o-color-white);
      line-height: 76px;
    }
  }
}
.title {
  height: 48px;
  width: auto;
  background-color: var(--o-color-bg2);
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: var(--o-color-text1);
  .left {
    background-image: url('@/assets/left_down.png');
    width: 16px;
    height: 16px;
    position: absolute;
    left: 26px;
  }
}
main {
  position: relative;
  min-height: calc(100vh - 339px);
  background-color: var(--o-color-bg1);
  margin-top: 80px;
  overflow: hidden;

  @media (max-width: 1100px) {
    margin-top: 48px;
  }
}
</style>

<style></style>
