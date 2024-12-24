<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'shared/i18n/index';
import { useCommonData } from 'shared/stores/common';
import { ElDialog } from 'element-plus';

const i18n = useI18n();
const clickShow = ref(false);
const { lang, loginParams, selectLoginType } = useCommonData();

const closeBox = () => {
  clickShow.value = false;
};
const show = () => {
  clickShow.value = true;
};

// 隐私政策、法律声明
const goToOtherPage = (type: string) => {
  const origin = import.meta.env.VITE_OPENEULER_WEBSITE;
  const url = `${origin}/${lang.value}/other/${type}`;
  window.open(url, '_blank');
};

defineExpose({ show });
</script>

<template>
  <el-dialog
    v-model="clickShow"
    width="450px"
    align-center
    center
    class="dialog"
  >
    <template #header>
      <div class="title">
        {{ i18n.SIGN_PRIVACY_STATEMENT }}
      </div>
    </template>
    <div class="content">
      <span class="cursor">
        {{ i18n.PLEASE_AGREE_FIRST }}
      </span>
      <span>&nbsp;</span>
      <a @click="goToOtherPage('privacy')">{{ i18n.PRIVACY_POLICY }}</a>
      {{ i18n.AND }}
      <a @click="goToOtherPage('legal')">{{ i18n.LEGAL_NOTICE }}</a>
    </div>
    <template #footer>
      <div class="footer">
        <OButton
          size="small"
          type="primary"
          class="btn-radius"
          @click="$emit('success')"
          >{{ i18n.CONFIRM }}</OButton
        >
        <OButton size="small" class="btn-radius" @click="closeBox">{{
          i18n.CANCEL
        }}</OButton>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.dialog {
    padding: 32px 0;
  border-radius: 4px;
  .el-dialog__header {
    padding: 0;
    .el-dialog__headerbtn {
      top: 0;
    }
    .el-icon {
        width: 30px;
        height: 30px;
        fill: #303030;
        color: #303030;
        svg {
          width: 100%;
          height: 100%;
        }
    }
  }
  .el-dialog__body {
    padding-top: 28px;
    padding-bottom: 36px;
  }
  .el-dialog__footer {
    padding: 0;
  }
}

.title {
  font-size: 24px;
  color: #000;
  line-height: 32px;
  font-weight: Medium;
}
.content {
  font-size: 16px;
  color: #000;
  line-height: 24px;
  text-align: center;
  .cursor {
    cursor: pointer;
  }
}
.footer {
  button {
    width: 96px;
    display: inline-block;
  }
  .btn-radius {
    border-radius: 28px;
  }
  .btn-radius + .btn-radius {
    margin-left: 16px;
  }
}
</style>
