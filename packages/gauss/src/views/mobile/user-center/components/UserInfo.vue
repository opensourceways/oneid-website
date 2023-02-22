<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { useI18n, useI18nStr } from "shared/i18n";
import ContentBox from "./ContentBox.vue";
import { useCommon, useCommonData } from "shared/stores/common";
import { modifyUser } from "shared/api/api-center";
import { ElMessage, FormInstance, FormItemRule } from "element-plus";
import { getCommunityParams } from "@/shared/utils";
import { Observable } from "rxjs";
import { IObject } from "shared/@types/interface";
import { getCompanyRules, getNicknammeRules, formValidator } from "shared/utils/utils";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import { useRouter } from "vue-router";
const router = useRouter();
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

// 公司校验
const companyRules = reactive<FormItemRule[]>([
  {
    required: true,
    message: (useI18nStr("NOT_EMPTY") as unknown) as string,
    trigger: "blur",
  },
  ...getCompanyRules(),
]);
const data = ref([
  {
    key: "username",
    label: useI18nStr("USER_NAME"),
    disabled: true,
  },
  {
    key: "email",
    label: useI18nStr("EMAIL"),
    placeholder: "-",
    disabled: true,
  },
  {
    key: "phone",
    label: useI18nStr("PHONE"),
    placeholder: "-",
    disabled: true,
  },
  {
    key: "signedUp",
    label: useI18nStr("SIGNED_UP"),
    disabled: true,
  },
  {
    key: "nickname",
    label: useI18nStr("NICKNAME"),
    placeholder: useI18nStr("ENTER_NICKNAME"),
    disabled: false,
    rules: getNicknammeRules(),
  },
  {
    key: "company",
    label: useI18nStr("COMPANY"),
    placeholder: useI18nStr("ENTER_COMPANY"),
    disabled: false,
    rules: companyRules,
  },
]);

// 表单值
const form = reactive({
  username: "",
  email: "",
  phone: "",
  signedUp: "",
  nickname: "",
  company: "",
} as any);
const initData = () => {
  data.value.forEach((item: IObject) => {
    if (item.key in userInfo.value) {
      if (item.key === "signedUp") {
        form[item.key] = getTimeData(userInfo.value[item.key]);
      } else {
        form[item.key] = userInfo.value[item.key] || "";
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
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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

const goToTree = () => {
  router.push(`/${store.lang}/mobile/profile`);
};
</script>
<template>
  <AppHeader />
  <main>
    <div class="img_box">
      <div class="title1">
        <!-- <h1 class="title-in">USER CENTER</h1> -->
        <h1 class="title1-out">{{ i18n.USER_CENTER }}</h1>
        <img class="title1-login" src="@/assets/login_log.png" />
      </div>
    </div>
    <div class="title">
      <span class="left" @click="goToTree"> </span
      ><span style="font-size: 16px">{{ i18n.INFO }}</span>
    </div>
    <ContentBox>
      <template #content>
        <el-form ref="formRef1" label-width="0" :model="form">
          <div v-for="item in data" :key="item.key" class="info-item">
            <p class="info-label">{{ item.label }}</p>
            <el-form-item :prop="item.key" class="info-form-pd" :rules="item.rules">
              <OInput
                v-model="form[item.key]"
                class="info-input"
                :disabled="item.disabled"
                :placeholder="item.placeholder"
              />
            </el-form-item>
          </div>
        </el-form>
        <OButton class="btn" size="small" type="primary" @click="submit(formRef1)">{{
          i18n.SAVE
        }}</OButton>
      </template>
    </ContentBox>
  </main>
  <AppFooter />
</template>
<style lang="scss" scoped>
.img_box {
  width: 100%;
  height: 100px;
  background-image: url("@/assets/banner.png");
  background-size: cover;
  background-repeat: no-repeat;
  // background-position: left;
  .title1 {
    margin: 0 auto;
    max-width: 1472px;
    padding: 0 var(--o-spacing-h6);
    position: relative;
    &-in {
      position: absolute;
      top: 60px;
      font-size: 68px;
      font-weight: bold;
      color: rgba(0, 47, 167, 0.14);
      line-height: 34px;
    }
    &-out {
      position: absolute;
      top: 35px;
      font-size: 24px;
      font-weight: 300;
      color: var(--o-color-white);
      line-height: 30px;
    }
    &-login {
      position: absolute;
      top: 20px;
      right: 0;
      margin-right: var(--o-spacing-h6);
      width: 90px;
      height: 60px;
    }
  }
}
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
    height: 35px;
    margin-bottom: 25px;
    margin-left: 16px;
    margin-top:25px;
    display: flex;
    align-items: center;
  }
  .info-input {
    width: 80%;
  }
  .info-form-pd {
    padding: 19px 0;
    z-index:1
  }
}
.btn {
  margin-top: var(--o-spacing-h4);
  position: relative;
  left: 40%;
}
.banner {
  width: auto;
  height: auto;
  background-image: url("@/assets/login_log.png");
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
    background-image: url("@/assets/left_down.png");
    width: 16px;
    height: 16px;
    position: absolute;
    left: 26px;
  }
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
:deep(.el-form-item) {
  margin-bottom: 0px !important;
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
