<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n, useI18nStr } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import { useCommon, useCommonData } from 'shared/stores/common';
import { modifyUser } from 'shared/api/api-center';
import { ElMessage, FormInstance, FormItemRule } from 'element-plus';
import { getUsernammeRules } from '@/shared/utils';
import { Observable } from 'rxjs';
import { IObject } from 'shared/@types/interface';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
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
    key: 'username',
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
    key: 'nickname',
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
  store.initUserInfo();
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
    if (!userInfo.value.username) {
      formEl[0].validate((valid: boolean) => {
        if (valid) {
          Object.assign(param, { username: form.username });
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
  username: '',
} as any);
// 用户名校验
const userNameRules = reactive<FormItemRule[]>(getUsernammeRules());
const goToTree = () => {
  router.push(`/${store.lang}/mobile/profile`);
};
</script>
<template>
  <AppHeader />
  <main>
    <div class="banner">
      <!-- <div class="title">
      <h1 class="title-in">USER CENTER</h1>
      <h1 class="title-out">{{ i18n.USER_CENTER }}</h1>
    </div> -->
    </div>
    <div class="title">
      <span class="left" @click="goToTree"> </span
      ><span style="font-size: 16px">{{ i18n.INFO }}</span>
    </div>
    <ContentBox>
      <!-- <template #header>
      {{ i18n.INFO }}
    </template> -->
      <template #content>
        <div v-for="item in data" :key="item.key" class="info-item">
          <p class="info-label">{{ item.label }}</p>
          <el-form
            v-if="item.key === 'username' && !item.value"
            ref="formRef1"
            label-width="0"
            :model="form"
          >
            <el-form-item
              prop="username"
              :rules="userNameRules"
              class="info-form-pd"
            >
              <OInput
                v-model="form.username"
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
  </main>

  <AppFooter />
</template>
<style lang="scss" scoped>
.info-item {
  display: flex;
  background-color: var(--o-color-bg2);
  margin-bottom: 16px;
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
  .info-form-pd {
    padding-bottom: var(--o-spacing-h9);
  }
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
