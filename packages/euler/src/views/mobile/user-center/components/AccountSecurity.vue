<script setup lang="ts">
import { reactive, ref } from "vue";
import { useI18n } from "shared/i18n";
import ContentBox from "./ContentBox.vue";
import { deleteAccount } from "shared/api/api-center";
import { ElMessage, FormInstance } from "element-plus";
import { saveUserAuth } from "shared/utils/login";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import { useRouter } from "vue-router";
import { useCommon } from "shared/stores/common";
const store = useCommon();
const router = useRouter();
const i18n = useI18n();
// 控制弹窗显示
const vilible = ref(false);

const submit = () => {
  vilible.value = true;
};
const close = () => {
  form.text = "";
  vilible.value = false;
};
// 表单值
const formRef = ref<FormInstance>();
const form = reactive({
  text: "",
} as any);
const validatorText = (rule: any, value: any, callback: any) => {
  if (value === "delete") {
    callback();
  } else {
    callback(i18n.value.DELETE_ENTER_ERR);
  }
};
const rules = ref([
  {
    validator: validatorText,
    trigger: "blur",
  },
]);
const confirm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      deleteAccount().then(() => {
        ElMessage.success({
          showClose: true,
          message: i18n.value.DELETE_SUCCESS,
        });
        vilible.value = false;
        saveUserAuth();
        location.href = `/${store.lang}/mobile/profile`;
      });
    } else {
      return false;
    }
  });
};
const goToTree = () => {
  router.push(`/${store.lang}/mobile/profile`);
};
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
      <span class="left" @click="goToTree"></span>
      <span style="font-size: 16px">{{ i18n.SECURITY }}</span>
    </div>
    <ContentBox>
      <!-- <template #header>
      {{ i18n.SECURITY }}
    </template> -->
      <template #content>
        <div class="tips">
          <div class="tips-title">{{ i18n.DELETE_ACCOUNT }}</div>
          <div class="tips-content">{{ i18n.DELETE_ACCOUNT_TIPS }}</div>
        </div>
        <OButton size="small" class="btn" @click="submit">{{ i18n.DELETE }}</OButton>
      </template>
    </ContentBox>
  </main>
  <el-dialog
    v-model="vilible"
    :draggable="true"
    width="100%"
    :before-close="close"
    :close-on-click-modal="false"
    :show-close="false"
    :destroy-on-close="true"
  >
    <template #header>
      <h5 class="header">{{ i18n.DELETE_ACCOUNT }}</h5>
    </template>
    <div class="Omain">
      <div>{{ i18n.DELETE_ACCOUNT_WARNING }}</div>
      <div class="delete-tips">{{ i18n.DELETE_ENTER }}</div>
      <el-form ref="formRef" label-width="auto" :model="form" style="max-width: 460px">
        <el-form-item prop="text" :rules="rules">
          <OInput v-model="form.text" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="Ofooter">
        <OButton class="close-btn footer-btn" size="small" @click="close">{{
          i18n.CANCEL
        }}</OButton>
        <OButton
          class="Ofooter-btn"
          size="small"
          type="primary"
          @click="confirm(formRef)"
          >{{ i18n.CONFIRM }}</OButton
        >
      </div>
    </template>
  </el-dialog>
  <AppFooter />
</template>
<style lang="scss" scoped>
.tips {
  border: 1px solid var(--o-color-border2);
  background-color: var(--o-color-bg2);
  padding: var(--o-spacing-h4) var(--o-spacing-h5);
  color: var(--o-color-error1);
  &-title {
    font-size: var(--o-font-size-h7);
    line-height: var(--o-line-height-h7);
    font-weight: 500;
    margin-bottom: var(--o-spacing-h5);
  }
  &-content {
    font-size: var(--o-font-size-text);
    line-height: var(--o-line-height-text);
    font-weight: normal;
  }
}
.btn {
  margin-top: var(--o-spacing-h4);
  position: relative;
  left: 40%;
}
.header {
  font-size: var(--o-font-size-h5);
  line-height: var(--o-line-height-h5);
  font-weight: 600;
  text-align: center;
}
.Ofooter {
  display: flex;
  justify-content: center;
  .close-btn {
    margin-right: var(--o-spacing-h4);
  }
}
.Omain {
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
.banner {
  width: 100%;
  height: 126px;
  background-image: url("@/assets/banner_mobile.png");
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
  color: var(--o-color-text1);
  .left {
    background-image: url("@/assets/left_down.png");
    width: 16px;
    height: 16px;
    position: absolute;
    left: 26px;
    // margin-bottom: 20px;
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
