<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import { deleteAccount } from 'shared/api/api-center';
import { ElMessage } from 'element-plus';
import { saveUserAuth, useStoreData, refreshInfo } from 'shared/utils/login';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useRouter } from 'vue-router';
import { useCommon, useCommonData } from 'shared/stores/common';
import DeleteAccountModal from 'shared/components/DeleteAccountModal.vue';
import ModifyPwd from 'shared/components/ModifyPwd.vue';
import DeleteAgreeModal from 'shared/components/DeleteAgreeModal.vue';
const store = useCommon();
const router = useRouter();
const i18n = useI18n();
const { lang } = useCommonData();
const { guardAuthClient } = useStoreData();
// 控制弹窗显示
const vilible = ref(false);

const submit = () => {
  vilible.value = true;
};

const confirm = () => {
  deleteAccount().then(() => {
    ElMessage.success({
      showClose: true,
      message: i18n.value.DELETE_SUCCESS,
    });
    vilible.value = false;
    saveUserAuth();
    location.href = `/${store.lang}/mobile/profile`;
  });
};

const pwdVilible = ref(false);
const agreeVilible = ref(false);
const goToTree = () => {
  router.push(`/${store.lang}/mobile/profile`);
};
const agreeUrl = `${
  import.meta.env.VITE_OPENEULER_WEBSITE
}/zh/other/search/agreement/`;
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
      <template #content>
        <div class="tips">
          <div class="tips-title">{{ i18n.MODIFY_PWD }}</div>
          <div class="tips-content">{{ i18n.MODIFY_PWD_TIP }}</div>
        </div>
        <div class="btn gap">
          <OButton size="small" @click="pwdVilible = true">{{
            i18n.MODIFY_PWD
          }}</OButton>
        </div>
        <template v-if="lang === 'zh' && guardAuthClient.aigcPrivacyAccepted">
          <div class="tips">
            <div class="tips-title">终止协议</div>
            <div class="tips-content">
              终止openEuler社区搜索服务
              <a :href="agreeUrl" rel="noopener noreferrer" target="_blank">
                用户协议
              </a>
            </div>
          </div>
          <div class="btn gap">
            <OButton size="small" @click="agreeVilible = true"> 终止 </OButton>
          </div>
        </template>
        <div class="tips red">
          <div class="tips-title">{{ i18n.DELETE_ACCOUNT }}</div>
          <div class="tips-content">{{ i18n.DELETE_ACCOUNT_TIPS }}</div>
        </div>
        <div class="btn">
          <OButton size="small" @click="submit">{{ i18n.DELETE }}</OButton>
        </div>
      </template>
    </ContentBox>
  </main>
  <DeleteAccountModal v-model="vilible" @submit="confirm"></DeleteAccountModal>
  <DeleteAgreeModal
    v-model="agreeVilible"
    @submit="refreshInfo"
  ></DeleteAgreeModal>
  <ModifyPwd v-model="pwdVilible"></ModifyPwd>
  <AppFooter />
</template>
<style lang="scss" scoped>
.tips {
  border: 1px solid var(--o-color-border2);
  background-color: var(--o-color-bg2);
  padding: var(--o-spacing-h4) var(--o-spacing-h5);
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
.red {
  color: var(--o-color-error1);
}
.gap {
  margin-bottom: var(--o-spacing-h2);
}
.btn {
  margin-top: var(--o-spacing-h4);
  display: flex;
  justify-content: center;
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
