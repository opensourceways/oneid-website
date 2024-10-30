<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import { deleteAccount } from 'shared/api/api-center';
import ModifyPwd from 'shared/components/ModifyPwd.vue';
import DeleteAccountModal from 'shared/components/DeleteAccountModal.vue';
import DeleteAgreeModal from 'shared/components/DeleteAgreeModal.vue';
import DeletePrivacyModal from 'shared/components/DeletePrivacyModal.vue';
import { ElMessage } from 'element-plus';
import { 
  saveUserAuth,
  useStoreData,
  refreshInfo,
  logout 
} from 'shared/utils/login';
import { useCommonData } from 'shared/stores/common';

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
    window.location.reload();
  });
};

const pwdVilible = ref(false);
const agreeVilible = ref(false);
const privacyVilible = ref(false);

const agreeUrl = `${
  import.meta.env.VITE_OPENEULER_WEBSITE
}/zh/agreement/search/`;
// 隐私政策、法律声明
const goToOtherPage = (type: string) => {
  const origin = import.meta.env.VITE_OPENEULER_WEBSITE;
  const url = `${origin}/${lang.value}/other/${type}`;
  window.open(url, '_blank');
};
</script>
<template>
  <ContentBox>
    <template #header>
      {{ i18n.SECURITY }}
    </template>
    <template #content>
      <div class="tips">
        <div class="tips-title">{{ i18n.FORGET_PWD }}</div>
        <div class="tips-content">{{ i18n.MODIFY_PWD_TIP }}</div>
      </div>
      <OButton size="small" class="btn gap" @click="pwdVilible = true">{{
        i18n.FORGET_PWD
      }}</OButton>
      <template v-if="lang === 'zh' && guardAuthClient.aigcPrivacyAccepted">
        <div class="tips">
          <div class="tips-title">终止协议</div>
          <div class="tips-content">
            终止
            <a :href="agreeUrl" rel="noopener noreferrer" target="_blank">
              《openEuler社区搜索服务用户协议》
            </a>
          </div>
        </div>
        <OButton size="small" class="btn gap" @click="agreeVilible = true">
          终止
        </OButton>
      </template>
      <template v-if="guardAuthClient.oneidPrivacyAccepted">
        <div class="tips">
          <div class="tips-title">{{ i18n.CANCEL_SIGN }}</div>
          <div class="tips-content">
            {{ i18n.CANCEL_SIGN_OF }}
            <a @click="goToOtherPage('privacy')">{{ i18n.PRIVACY_POLICY }}</a>
            {{ i18n.AND }}
            <a @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</a>
          </div>
        </div>
        <OButton size="small" class="btn gap" @click="privacyVilible = true">
          {{ i18n.CANCEL_SIGN }}
        </OButton>
      </template>
      <div class="tips red">
        <div class="tips-title">{{ i18n.DELETE_ACCOUNT }}</div>
        <div class="tips-content">{{ i18n.DELETE_ACCOUNT_TIPS }}</div>
      </div>
      <OButton size="small" class="btn" @click="submit">{{
        i18n.DELETE
      }}</OButton>
    </template>
  </ContentBox>
  <DeleteAccountModal v-model="vilible" @submit="confirm"></DeleteAccountModal>
  <DeleteAgreeModal
    v-model="agreeVilible"
    @submit="refreshInfo"
  ></DeleteAgreeModal>
  <DeletePrivacyModal
    v-model="privacyVilible"
    @submit="logout()"
  ></DeletePrivacyModal>
  <ModifyPwd v-model="pwdVilible"></ModifyPwd>
</template>
<style lang="scss" scoped>
.tips {
  border: 1px solid var(--o-color-border2);
  background-color: rgba(0, 47, 167, 0.03);
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
.btn {
  margin-top: var(--o-spacing-h4);
}
.gap {
  margin-bottom: var(--o-spacing-h2);
}
</style>
