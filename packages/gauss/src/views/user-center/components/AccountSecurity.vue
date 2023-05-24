<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useI18n } from 'shared/i18n';
import ContentBox from './ContentBox.vue';
import { deleteAccount } from 'shared/api/api-center';
import ForgotPwdModal from 'shared/components/ForgotPwdModal.vue';
import DeleteAccountModal from 'shared/components/DeleteAccountModal.vue';
import { ElMessage, FormInstance } from 'element-plus';
import { saveUserAuth } from 'shared/utils/login';
import { getCommunityParams } from '@/shared/utils';

const i18n = useI18n();
// 控制弹窗显示
const vilible = ref(false);

const submit = () => {
  vilible.value = true;
};
const confirm = () => {
  deleteAccount(getCommunityParams(true)).then(() => {
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
</script>
<template>
  <ContentBox>
    <template #header>
      {{ i18n.SECURITY }}
    </template>
    <template #content>
      <div class="tips">
        <div class="tips-title">{{ i18n.MODIFY_PWD }}</div>
        <div class="tips-content">{{ i18n.MODIFY_PWD_TIP }}</div>
      </div>
      <OButton size="small" class="btn gap" @click="pwdVilible = true">{{
        i18n.MODIFY_PWD
      }}</OButton>
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
  <ForgotPwdModal v-model="pwdVilible" :is-modify="true"></ForgotPwdModal>
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
